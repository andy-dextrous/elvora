"use client"

import { SectionIntro } from "@/components/layout/section-intro"
import { cn } from "@/utilities/ui"
import dynamic from "next/dynamic"
import { useEffect, useState, useRef, useImperativeHandle } from "react"

/*************************************************************************/
/*  DYNAMIC REACT GLOBE COMPONENT
/*************************************************************************/

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
})

/*************************************************************************/
/*  LOCATION DATA
/*************************************************************************/

const locations = [
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    address: "Sheikh Zayed Road, Downtown Dubai",
    lat: 25.2048,
    lng: 55.2708,
    description: "Global business hub in the Middle East",
    color: "#7944B3", // amber
  },
  {
    id: "dublin",
    name: "Dublin",
    country: "Ireland",
    address: "Temple Bar, Dublin 2",
    lat: 53.3498,
    lng: -6.2603,
    description: "European tech capital and cultural center",
    color: "#4400FF", // emerald
  },
]

/*************************************************************************/
/*  TYPES
/*************************************************************************/

interface Location {
  id: string
  name: string
  lat: number
  lng: number
  color: string
}

interface GlobeComponentProps {
  locations: Location[]
  ref?: React.Ref<GlobeComponentRef>
}

interface GlobeComponentRef {
  navigateToPoint: (lat: number, lng: number, altitude: number) => void
}

/*************************************************************************/
/*  GLOBE COMPONENT
/*************************************************************************/

function GlobeComponent({ locations, ref }: GlobeComponentProps) {
  const [countries, setCountries] = useState([])
  const globeRef = useRef<any>(null)

  useEffect(() => {
    fetch("/ne_110m_admin_0_countries.geojson", {
      cache: "force-cache",
    })
      .then(res => res.json())
      .then(data => setCountries(data.features))
  }, [])

  /*************************************************************************/
  /*  GLOBE SETUP
  /*************************************************************************/

  const handleGlobeReady = () => {
    if (globeRef.current && locations.length > 0) {
      // Set initial view to first location
      const firstLocation = locations[0]
      globeRef.current.pointOfView(
        {
          lat: firstLocation.lat,
          lng: firstLocation.lng,
          altitude: 1.5,
        },
        400
      )
    }
  }

  /*************************************************************************/
  /*  NAVIGATION HANDLER
  /*************************************************************************/

  const navigateToPoint = (lat: number, lng: number, altitude: number) => {
    if (globeRef.current) {
      globeRef.current.pointOfView(
        {
          lat,
          lng,
          altitude,
        },
        400
      )
    }
  }

  useImperativeHandle(ref, () => ({
    navigateToPoint,
  }))

  return (
    <div className="pointer-events-none relative h-full w-full">
      <Globe
        ref={globeRef}
        onGlobeReady={handleGlobeReady}
        backgroundColor="rgba(0,0,0,0)"
        showGlobe={false}
        enablePointerInteraction={false}
        globeOffset={[-200, 0]}
        // Country polygons
        hexPolygonsData={countries}
        hexPolygonResolution={3}
        hexPolygonMargin={0.3}
        hexPolygonUseDots={true}
        hexPolygonColor={() => "#181A25"}
        hexPolygonAltitude={0.002}
        // Location markers
        pointsData={locations}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d: any) => d.color}
        pointAltitude={0.02}
        pointRadius={0.8}
        pointLabel={(
          d: any
        ) => `<div style="background: black; color: white; padding: 8px; border-radius: 4px;">
          <strong>${d.name}</strong>
        </div>`}
        showAtmosphere={false}
      />
    </div>
  )
}

/*************************************************************************/
/*  LOCATION CARDS COMPONENT
/*************************************************************************/

function LocationCards({
  onLocationClick,
  selectedLocationId,
}: {
  onLocationClick: (location: any) => void
  selectedLocationId: string
}) {
  return (
    <div className="w-full space-y-4">
      {locations.map(location => (
        <div
          key={location.id}
          onClick={() => onLocationClick(location)}
          className={cn(
            "cursor-pointer border p-6 backdrop-blur-sm transition-all duration-300",
            selectedLocationId === location.id
              ? "bg-dark-950/60 gradient-border"
              : "bg-dark-950/40 hover:bg-dark-950/60 border-gray-700"
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className="mt-2 h-3 w-3 flex-shrink-0 rounded-full"
              style={{ backgroundColor: location.color }}
            />
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-white">{location.name}</h3>
              <p className="mb-2 text-sm text-gray-300">{location.country}</p>
              <p className="mb-3 text-xs text-gray-400">{location.address}</p>
              <p className="text-sm text-gray-300">{location.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/*************************************************************************/
/*  MAIN PAGE COMPONENT
/*************************************************************************/

function Page() {
  const globeRef = useRef<GlobeComponentRef>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0].id)

  // Map locations to match Globe component interface
  const globeLocations: Location[] = locations.map(location => ({
    id: location.id,
    name: location.name,
    lat: location.lat,
    lng: location.lng,
    color: location.color,
  }))

  const handleLocationClick = (location: any) => {
    setSelectedLocationId(location.id)
    if (globeRef.current) {
      globeRef.current.navigateToPoint(location.lat, location.lng, 1.5)
    }
  }

  return (
    <main className="pt-nav">
      <Hero />
      <section className="bg-dark relative">
        <SectionIntro
          heading={"Global <span>Locations</span>"}
          headingClassName="text-white"
          descriptionClassName="font-light text-white"
        />

        <div className="relative h-screen w-full">
          <div className="relative z-10 container grid h-full grid-cols-10">
            <div className="col-span-3 col-start-8 flex h-full items-center">
              <LocationCards
                onLocationClick={handleLocationClick}
                selectedLocationId={selectedLocationId}
              />
            </div>
          </div>
          <div className="absolute inset-0 z-[0] min-h-screen w-full">
            <GlobeComponent ref={globeRef} locations={globeLocations} />
          </div>
        </div>
      </section>
    </main>
  )
}

export default Page

const Hero = () => {
  return (
    <section className="min-h-screen">
      <div className="container">
        <h1>Contact Us</h1>
      </div>
    </section>
  )
}
