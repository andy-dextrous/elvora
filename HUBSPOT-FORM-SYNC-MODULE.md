# HubSpot Form Sync Module

A complete implementation guide for adding HubSpot form syncing capabilities to Payload CMS projects, based on the proven implementation in `demos/website-main`.

## Overview

This module provides automatic syncing of Payload CMS form submissions to HubSpot, including visitor tracking context and page analytics. The integration is opt-in via environment variables and requires minimal configuration.

**Reference Implementation:** `demos/website-main/src/payload.config.ts` (lines 376-490)

## Features

- ✅ Automatic form submission syncing to HubSpot
- ✅ HubSpot visitor tracking cookie preservation
- ✅ Page context capture (URL, page name)
- ✅ reCAPTCHA integration
- ✅ Error handling and logging
- ✅ Admin-friendly form configuration
- ✅ Opt-in via environment variables

## Implementation Plan

### Step 1: Environment Variables Setup

Add these environment variables to enable HubSpot integration:

```env
# HubSpot Integration (Required)
NEXT_PRIVATE_HUBSPOT_PORTAL_KEY=your_hubspot_portal_id
NEXT_PRIVATE_HUBSPOT_ENABLED=true

# reCAPTCHA (Optional but recommended)
NEXT_PRIVATE_RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 2: Utility Functions

#### 2.1 Cookie Utility (`src/utilities/get-cookie.ts`)

**Reference:** `demos/website-main/src/utilities/get-cookie.ts`

```typescript
/**
 * Extract cookie value by name from document.cookie
 * Used specifically for HubSpot tracking cookie (hubspotutk)
 */
export function getCookie(cookiename: string): string {
  // Get name followed by anything except a semicolon
  const cookiestring = RegExp(cookiename + "=[^;]+").exec(document.cookie)
  // Return everything after the equal sign, or an empty string if the cookie name not found
  return decodeURIComponent(
    cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : ""
  )
}
```

#### 2.2 HubSpot Integration Utility (`src/utilities/hubspot-integration.ts`)

```typescript
/**
 * HubSpot Forms API integration utility
 * Handles the actual submission to HubSpot
 */

interface HubSpotSubmissionData {
  form: any
  submissionData: Array<{ field: string; value: any }>
  context?: {
    hutk?: string
    pageName?: string
    pageUri?: string
  }
}

export async function sendSubmissionToHubSpot(
  data: HubSpotSubmissionData
): Promise<void> {
  const { form, submissionData, context = {} } = data
  const portalID = process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY

  if (!portalID) {
    throw new Error("HubSpot Portal ID not configured")
  }

  if (!form.hubSpotFormID) {
    throw new Error("HubSpot Form ID not set for this form")
  }

  const payload = {
    context,
    fields: submissionData.map(item => ({
      name: item.field,
      value: item.value,
    })),
  }

  const response = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalID}/${form.hubSpotFormID}`,
    {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  )

  if (!response.ok) {
    throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`)
  }
}
```

### Step 3: Payload Configuration Module

#### 3.1 HubSpot Form Builder Plugin Extension (`src/payload/plugins/hubspot-forms.ts`)

```typescript
import { revalidateTag } from "next/cache"
import type { Plugin } from "payload"
import { sendSubmissionToHubSpot } from "@/utilities/hubspot-integration"

/**
 * HubSpot Forms Integration Plugin
 * Extends Payload's form builder with HubSpot syncing capabilities
 */

export const hubspotFormsPlugin = (): Plugin => {
  return {
    name: "hubspot-forms",
    init: () => {
      // Plugin initialization if needed
    },
  }
}

/**
 * Form builder plugin configuration with HubSpot integration
 * Add this to your formBuilderPlugin() configuration
 */
export const getHubSpotFormBuilderConfig = () => {
  const isHubSpotEnabled = process.env.NEXT_PRIVATE_HUBSPOT_ENABLED === "true"

  if (!isHubSpotEnabled) {
    return {
      formOverrides: {},
      formSubmissionOverrides: {},
    }
  }

  return {
    formOverrides: {
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "hubSpotFormID",
          type: "text",
          admin: {
            position: "sidebar",
            description:
              "Required for HubSpot integration. Find this in your HubSpot form settings.",
          },
          label: "HubSpot Form ID",
        },
        {
          name: "customID",
          type: "text",
          admin: {
            description: "Attached to submission button to track clicks",
            position: "sidebar",
          },
          label: "Custom ID",
        },
        {
          name: "requireRecaptcha",
          type: "checkbox",
          admin: {
            position: "sidebar",
          },
          label: "Require reCAPTCHA",
        },
      ],
      hooks: {
        afterChange: [
          ({ doc }) => {
            revalidateTag(`form-${doc.title}`)
            console.log(`Revalidated form: ${doc.title}`)
          },
        ],
      },
    },
    formSubmissionOverrides: {
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "recaptcha",
          type: "text",
          validate: async (value, { req, siblingData }) => {
            const form = await req.payload.findByID({
              id: siblingData?.form,
              collection: "forms",
            })

            if (!form?.requireRecaptcha) {
              return true
            }

            if (!value) {
              return "Please complete the reCAPTCHA"
            }

            const secretKey = process.env.NEXT_PRIVATE_RECAPTCHA_SECRET_KEY
            if (!secretKey) {
              req.payload.logger.warn("reCAPTCHA secret key not configured")
              return true // Don't block submission if not configured
            }

            const res = await fetch(
              `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${value}`,
              {
                method: "POST",
              }
            )
            const data = await res.json()
            if (!data.success) {
              return "Invalid captcha"
            } else {
              return true
            }
          },
        },
      ],
      hooks: {
        afterChange: [
          async ({ doc, req }) => {
            // Only proceed if HubSpot is enabled
            if (process.env.NEXT_PRIVATE_HUBSPOT_ENABLED !== "true") {
              return
            }

            req.payload.logger.info("Processing form submission for HubSpot sync")

            try {
              // Extract context from request body
              const body = req.json ? await req.json() : {}

              const context = {
                ...("hubspotCookie" in body && { hutk: body?.hubspotCookie }),
                pageName: "pageName" in body ? body?.pageName : "",
                pageUri: "pageUri" in body ? body?.pageUri : "",
              }

              await sendSubmissionToHubSpot({
                form: doc.form,
                submissionData: doc.submissionData,
                context,
              })

              req.payload.logger.info("Successfully synced form submission to HubSpot")
            } catch (err: unknown) {
              req.payload.logger.error({
                err,
                msg: "Failed to sync form submission to HubSpot",
                formId: doc.form?.id,
              })
              // Don't throw - we don't want to break the form submission
            }
          },
        ],
      },
    },
  }
}
```

### Step 4: Frontend Form Component

#### 4.1 Enhanced CMS Form Component (`src/components/cms-form/index.tsx`)

**Reference:** `demos/website-main/src/components/CMSForm/index.tsx`

```typescript
'use client'

import type { Form as FormType } from '@/payload-types'
import { getCookie } from '@/utilities/get-cookie'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface CMSFormProps {
  form?: FormType | null | string
  hiddenFields?: string[]
}

/*************************************************************************/
/*  FORM STATE MANAGEMENT
/*************************************************************************/

const buildInitialState = (fields: any[]) => {
  const state = {}

  fields.forEach((field) => {
    state[field.name] = {
      errorMessage: 'This field is required.',
      initialValue: field.defaultValue ?? undefined,
      valid: !field.required || field.defaultValue !== undefined,
      value: field.defaultValue ?? undefined,
    }
  })

  return state
}

/*************************************************************************/
/*  MAIN FORM COMPONENT
/*************************************************************************/

const RenderForm = ({ form, hiddenFields = [] }: { form: FormType; hiddenFields: string[] }) => {
  const {
    id: formID,
    confirmationMessage,
    confirmationType,
    customID,
    redirect: formRedirect,
    submitButtonLabel,
    requireRecaptcha,
  } = form

  const [isLoading, setIsLoading] = React.useState(false)
  const [hasSubmitted, setHasSubmitted] = React.useState<boolean>()
  const [error, setError] = React.useState<{ message: string; status?: string } | undefined>()

  const initialState = buildInitialState(form.fields)
  const recaptcha = React.useRef<ReCAPTCHA>(null)
  const router = useRouter()
  const pathname = usePathname()

  /*************************************************************************/
  /*  FORM SUBMISSION HANDLER WITH HUBSPOT INTEGRATION
  /*************************************************************************/

  const onSubmit = React.useCallback(
    ({ data }) => {
      const submitForm = async () => {
        setError(undefined)
        setIsLoading(true)

        // reCAPTCHA validation
        const captchaValue = recaptcha.current ? recaptcha.current.getValue() : undefined
        if (requireRecaptcha && !captchaValue) {
          setIsLoading(false)
          alert('Please complete the reCAPTCHA.')
          return
        }

        // Format form data
        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        try {
          // Collect HubSpot context data
          const hubspotCookie = getCookie('hubspotutk')
          const pageUri = `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`
          const slugParts = pathname?.split('/')
          const pageName = slugParts?.at(-1) === '' ? 'Home' : slugParts?.at(-1)

          // Submit to Payload CMS (which will auto-sync to HubSpot)
          const req = await fetch('/api/form-submissions', {
            body: JSON.stringify({
              form: formID,
              hubspotCookie, // For HubSpot visitor tracking
              pageName,     // For HubSpot page context
              pageUri,      // For HubSpot page context
              recaptcha: captchaValue,
              submissionData: dataToSend,
            }),
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          if (!req.ok) {
            const { errors } = await req.json()
            for (const error of errors) {
              console.error('Form submission error:', error.message)
            }
            setIsLoading(false)
            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          // Handle redirect if configured
          if (confirmationType === 'redirect' && formRedirect) {
            const { url } = formRedirect
            if (url) {
              const redirectUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL)
              try {
                if (url.startsWith('/') || redirectUrl.origin === process.env.NEXT_PUBLIC_SITE_URL) {
                  router.push(redirectUrl.href)
                } else {
                  window.location.assign(url)
                }
              } catch (err) {
                console.warn('Redirect failed:', err)
              }
            }
          }
        } catch (err) {
          console.warn('Form submission failed:', err)
          setIsLoading(false)
          setError({ message: 'Something went wrong.' })
        }
      }

      submitForm()
    },
    [router, formID, formRedirect, confirmationType, pathname, requireRecaptcha],
  )

  if (!form?.id) {
    return null
  }

  return (
    <div className="cms-form">
      {!isLoading && hasSubmitted && confirmationType === 'message' && (
        <div className="confirmation-message">
          {/* Render confirmation message */}
        </div>
      )}

      {error && (
        <div className="error-message">
          {`${error.status || '500'}: ${error.message || ''}`}
        </div>
      )}

      {!hasSubmitted && (
        <form onSubmit={(e) => { e.preventDefault(); /* Handle form submission */ }}>
          {/* Render form fields */}
          {form.fields?.map((field, index) => {
            // Render each field based on field.blockType
            return <div key={index}>{/* Field component */}</div>
          })}

          {/* reCAPTCHA */}
          {requireRecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
            <ReCAPTCHA
              ref={recaptcha}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              theme="light"
            />
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            id={customID}
          >
            {isLoading ? 'Submitting...' : (submitButtonLabel || 'Submit')}
          </button>
        </form>
      )}
    </div>
  )
}

export const CMSForm: React.FC<CMSFormProps> = ({ form, hiddenFields = [] }) => {
  // Handle form loading if passed as string ID
  if (typeof form === 'string') {
    // Fetch form data by ID
    return <div>Loading form...</div>
  }

  if (!form) {
    return null
  }

  return <RenderForm form={form} hiddenFields={hiddenFields} />
}
```

### Step 5: Integration into Payload Config

#### 5.1 Update Your `payload.config.ts`

```typescript
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder"
import { getHubSpotFormBuilderConfig } from "./src/payload/plugins/hubspot-forms"

export default buildConfig({
  // ... other config
  plugins: [
    // ... other plugins
    formBuilderPlugin({
      ...getHubSpotFormBuilderConfig(),
      // Your existing form builder config
    }),
  ],
})
```

### Step 6: Type Definitions

#### 6.1 HubSpot Types (`src/types/hubspot.ts`)

```typescript
export interface HubSpotFormData {
  form: {
    id: string
    hubSpotFormID?: string
  }
  submissionData: Array<{
    field: string
    value: any
  }>
  context?: {
    hutk?: string
    pageName?: string
    pageUri?: string
  }
}

export interface HubSpotAPIResponse {
  success: boolean
  errors?: Array<{
    message: string
    code: string
  }>
}
```

### Step 7: Installation & Dependencies

#### 7.1 Required Package Dependencies

```json
{
  "dependencies": {
    "@payloadcms/plugin-form-builder": "latest",
    "react-google-recaptcha": "^3.1.0"
  },
  "devDependencies": {
    "@types/react-google-recaptcha": "^2.1.0"
  }
}
```

#### 7.2 Installation Commands

```bash
npm install @payloadcms/plugin-form-builder react-google-recaptcha
npm install -D @types/react-google-recaptcha
```

### Step 8: Configuration Checklist

- [ ] Environment variables configured
- [ ] HubSpot portal ID and form IDs set up
- [ ] reCAPTCHA keys configured (optional)
- [ ] Cookie utility implemented
- [ ] HubSpot integration utility created
- [ ] Payload plugin configuration added
- [ ] Frontend form component updated
- [ ] Types defined
- [ ] Dependencies installed

### Step 9: Usage Instructions

#### 9.1 Admin Setup

1. Create a form in Payload CMS admin
2. Add the HubSpot Form ID in the sidebar
3. Configure reCAPTCHA if needed
4. Set up form fields as needed

#### 9.2 Frontend Implementation

```typescript
import { CMSForm } from '@/components/cms-form'

export default function ContactPage({ form }) {
  return (
    <div>
      <h1>Contact Us</h1>
      <CMSForm form={form} />
    </div>
  )
}
```

### Step 10: Testing & Debugging

#### 10.1 Debug Mode

Add this to your environment for detailed logging:

```env
PAYLOAD_LOG_LEVEL=debug
```

#### 10.2 Test Checklist

- [ ] Form renders correctly
- [ ] HubSpot cookie is captured
- [ ] Page context is collected
- [ ] Form submits to Payload
- [ ] HubSpot receives submission
- [ ] Error handling works
- [ ] reCAPTCHA validation works

### Troubleshooting

#### Common Issues

1. **HubSpot API 403 Error**

   - Check portal ID and form ID are correct
   - Verify HubSpot form is published

2. **Missing Cookie Data**

   - Ensure HubSpot tracking code is installed
   - Check cookie domain settings

3. **reCAPTCHA Not Working**
   - Verify site key and secret key
   - Check domain whitelist in reCAPTCHA settings

#### Logs to Monitor

```typescript
// Check Payload logs for:
req.payload.logger.info("Processing form submission for HubSpot sync")
req.payload.logger.error("Failed to sync form submission to HubSpot")
```

## Benefits of This Implementation

- **Modular**: Can be added to any Payload CMS project
- **Opt-in**: Only active when environment variables are set
- **Error Resilient**: Form works even if HubSpot sync fails
- **Context Rich**: Preserves visitor tracking and page analytics
- **Admin Friendly**: Easy configuration through Payload admin
- **Type Safe**: Full TypeScript support

## References

- **Original Implementation**: `demos/website-main/src/payload.config.ts` (lines 376-490)
- **Frontend Component**: `demos/website-main/src/components/CMSForm/index.tsx`
- **Cookie Utility**: `demos/website-main/src/utilities/get-cookie.ts`
- **HubSpot Forms API**: https://developers.hubspot.com/docs/methods/forms/submit_form
