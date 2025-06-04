import type { CollectionSlug, Payload, PayloadRequest, File } from "payload"
import type { Media, User } from "@/payload/payload-types"
import type { Post } from "@/payload/payload-types"

/*************************************************************************/
/*  POSTS SEED DATA BASED ON LATEST ARTICLES COMPONENT
/*************************************************************************/

type PostSeedArgs = {
  heroImage: Media | null
  author: User
  categoryId?: string
}

function createDigitalTransformationPost({
  heroImage,
  author,
  categoryId,
}: PostSeedArgs): Omit<Post, "updatedAt" | "id" | "createdAt"> &
  Partial<Pick<Post, "updatedAt" | "id" | "createdAt">> {
  return {
    title: "The Future of Digital Transformation: Are You Moving Fast Enough?",
    slug: "future-digital-transformation",
    _status: "published",
    authors: [author.id],
    heroImage: heroImage?.id,
    categories: categoryId ? [categoryId] : [],
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "In today's hyper-competitive landscape, digital transformation is no longer a choice — it's a necessity. Leading businesses are redefining operations, embracing automation, and leveraging cloud technologies to drive efficiency and innovation.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The Speed of Change",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h2",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The pace of technological advancement has reached an unprecedented velocity. Companies that once dominated their markets are finding themselves displaced by nimble startups that leverage modern technologies from day one. The question isn't whether your business needs to transform digitally — it's whether you're moving fast enough to stay competitive.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "According to recent industry studies, 70% of companies are either in the middle of a digital transformation or have plans to begin one. However, only 30% of these initiatives succeed in creating lasting change. The difference lies in approach, speed, and execution.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Key Pillars of Modern Digital Transformation",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Cloud-First Architecture: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Migrating to cloud infrastructure isn't just about cost savings — it's about scalability, flexibility, and enabling remote work capabilities. Modern cloud solutions provide the foundation for rapid scaling and global reach.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Automation and AI Integration: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Intelligent automation is transforming how businesses operate. From customer service chatbots to predictive maintenance systems, AI is no longer a luxury but a competitive necessity.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Data-Driven Decision Making: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Real-time analytics and business intelligence tools are enabling companies to make informed decisions faster than ever before. The ability to pivot based on data insights is becoming a core business capability.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Common Transformation Challenges",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Many organizations face similar hurdles during their digital transformation journey. Legacy system integration remains one of the biggest challenges, often requiring significant investment and careful planning to avoid business disruption.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Cultural resistance to change is another major obstacle. Successful transformations require buy-in at all levels of the organization, from executive leadership to front-line employees. Change management strategies must be as robust as the technical implementation plan.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Measuring Success",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Digital transformation success isn't just measured in technology metrics. Key performance indicators should include customer satisfaction scores, employee productivity improvements, operational efficiency gains, and ultimately, revenue growth and market position strengthening.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The future belongs to organizations that can adapt quickly to changing market conditions while maintaining operational excellence. Digital transformation isn't a destination — it's an ongoing journey of continuous improvement and innovation.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
    meta: {
      title: "The Future of Digital Transformation: Are You Moving Fast Enough?",
      description:
        "In today's hyper-competitive landscape, digital transformation is no longer a choice — it's a necessity. Leading businesses are redefining operations, embracing automation, and leveraging cloud technologies to drive efficiency and innovation.",
      image: heroImage?.id,
    },
    publishedAt: new Date().toISOString(),
  }
}

function createAnalyticsStrategyPost({
  heroImage,
  author,
  categoryId,
}: PostSeedArgs): Omit<Post, "updatedAt" | "id" | "createdAt"> &
  Partial<Pick<Post, "updatedAt" | "id" | "createdAt">> {
  return {
    title: "From Data to Decisions: Building a Modern Analytics Strategy",
    slug: "data-to-decisions-analytics-strategy",
    _status: "published",
    authors: [author.id],
    heroImage: heroImage?.id,
    categories: categoryId ? [categoryId] : [],
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Smart companies don't just collect data — they use it to drive action. Learn how to architect a data strategy that works with your business goals, integrates seamlessly across platforms, and delivers real-time insights for smarter decision-making.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The Data Revolution",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h2",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "We live in an age where data is being generated at an unprecedented rate. Every click, transaction, sensor reading, and interaction creates valuable information that can drive business decisions. However, the challenge isn't in collecting data — it's in transforming that raw information into actionable insights.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Modern businesses are drowning in data but starving for insights. The companies that thrive are those that can effectively bridge the gap between data collection and strategic action.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Building Your Analytics Foundation",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Data Governance Framework: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Establishing clear policies for data quality, security, and access is fundamental. Your governance framework should define who can access what data, how it's stored, and how quality is maintained throughout the data lifecycle.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Unified Data Architecture: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Breaking down data silos is crucial for comprehensive analytics. A modern data warehouse or data lake approach allows for centralized storage while maintaining flexibility for different analytical needs.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Real-Time Processing Capabilities: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Modern business moves fast, and batch processing isn't always sufficient. Implementing stream processing and real-time analytics allows for immediate response to changing conditions and opportunities.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "From Insights to Action",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The most sophisticated analytics platform is worthless if insights don't translate into business action. Successful analytics strategies include clear processes for turning data discoveries into operational changes, marketing adjustments, or strategic pivots.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "This requires building analytics literacy across your organization. Teams need to understand not just how to read reports, but how to question data, identify patterns, and propose data-driven solutions to business challenges.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Machine Learning and Predictive Analytics",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Advanced analytics goes beyond historical reporting to predictive and prescriptive insights. Machine learning models can identify patterns humans might miss and predict future trends with increasing accuracy.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "However, implementing ML requires careful consideration of data quality, model bias, and interpretability. The goal isn't to replace human judgment but to augment it with data-driven insights that would be impossible to generate manually.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Measuring Analytics ROI",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "A successful analytics strategy demonstrates clear business value. This includes improved decision speed, reduced operational costs, increased revenue through better customer targeting, and risk mitigation through predictive insights.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The future of business is data-driven, but success lies in focusing on outcomes rather than technology. Build your analytics strategy around business objectives, and let those goals drive your technical decisions.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
    meta: {
      title: "From Data to Decisions: Building a Modern Analytics Strategy",
      description:
        "Smart companies don't just collect data — they use it to drive action. Learn how to architect a data strategy that works with your business goals, integrates seamlessly across platforms, and delivers real-time insights for smarter decision-making.",
      image: heroImage?.id,
    },
    publishedAt: new Date().toISOString(),
  }
}

function createScalingInfrastructurePost({
  heroImage,
  author,
  categoryId,
}: PostSeedArgs): Omit<Post, "updatedAt" | "id" | "createdAt"> &
  Partial<Pick<Post, "updatedAt" | "id" | "createdAt">> {
  return {
    title: "Scaling with Confidence: IT Infrastructure That Grows with You",
    slug: "scaling-it-infrastructure",
    _status: "published",
    authors: [author.id],
    heroImage: heroImage?.id,
    categories: categoryId ? [categoryId] : [],
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Is your technology stack ready for tomorrow's demands? Explore key considerations when designing scalable IT infrastructure — from cloud-native solutions to hybrid models — and how to future-proof your digital foundation.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The Scaling Challenge",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h2",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Business growth is exciting, but it can quickly become a nightmare if your IT infrastructure isn't prepared to scale. Many companies find themselves in a crisis when their systems buckle under increased demand, leading to downtime, poor user experience, and lost revenue.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The key to successful scaling isn't just about having more servers or bandwidth — it's about architecting systems that can grow gracefully while maintaining performance, security, and reliability.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Cloud-Native Architecture Principles",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Microservices Design: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Breaking monolithic applications into smaller, independent services allows for targeted scaling. Each service can be scaled independently based on demand, optimizing resource usage and improving fault tolerance.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Container Orchestration: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Technologies like Kubernetes provide automated scaling, deployment, and management of containerized applications. This enables rapid scaling and deployment while maintaining consistency across environments.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 1,
                mode: "normal",
                style: "",
                text: "Serverless Computing: ",
                version: 1,
              },
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "For certain workloads, serverless functions provide the ultimate in scalability, automatically adjusting to demand without any infrastructure management. This is particularly effective for event-driven applications and APIs.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Database Scaling Strategies",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Database bottlenecks are often the first scaling challenge businesses encounter. Traditional relational databases can be scaled vertically (more powerful hardware) or horizontally (multiple database instances).",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Modern NoSQL databases offer built-in horizontal scaling, while newer distributed SQL databases provide the consistency of relational databases with the scalability of NoSQL. The choice depends on your specific data patterns and consistency requirements.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Monitoring and Observability",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Scalable infrastructure requires comprehensive monitoring. You can't manage what you can't measure, and this becomes critical as systems grow more complex. Modern observability platforms provide insights into performance, errors, and user experience across your entire stack.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Implementing alerting systems that can differentiate between normal growth patterns and actual issues prevents both alert fatigue and missed critical problems.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Security at Scale",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "As systems scale, the attack surface grows. Implementing security measures that scale with your infrastructure is crucial. This includes automated security scanning, network segmentation, identity and access management, and compliance monitoring.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Zero-trust architecture principles become increasingly important as systems distribute across multiple cloud providers and edge locations.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "heading",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Cost Optimization in Scaling",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            tag: "h3",
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Scaling doesn't have to mean exponentially increasing costs. Intelligent auto-scaling policies, reserved instance planning, and workload optimization can actually improve cost efficiency as you grow.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The key is building scaling policies that match your business patterns — scaling up during peak hours and scaling down during low demand periods. This requires understanding your usage patterns and implementing automation that responds appropriately.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Building scalable infrastructure is an investment in your company's future. By planning for growth from the beginning and implementing the right architectural patterns, you can ensure your technology enables rather than limits your business success.",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
    meta: {
      title: "Scaling with Confidence: IT Infrastructure That Grows with You",
      description:
        "Is your technology stack ready for tomorrow's demands? Explore key considerations when designing scalable IT infrastructure — from cloud-native solutions to hybrid models — and how to future-proof your digital foundation.",
      image: heroImage?.id,
    },
    publishedAt: new Date().toISOString(),
  }
}

/*************************************************************************/
/*  POSTS-ONLY SEEDING FUNCTION
/*************************************************************************/

export const seedPosts = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info("Seeding posts only...")

  // Find or create demo author
  let demoAuthor
  const existingUsers = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: "demo-author@example.com",
      },
    },
    limit: 1,
  })

  if (existingUsers.docs.length > 0) {
    demoAuthor = existingUsers.docs[0]
    payload.logger.info(`— Using existing demo author...`)
  } else {
    payload.logger.info(`— Creating demo author...`)
    demoAuthor = await payload.create({
      collection: "users",
      data: {
        username: "demo-author",
        name: "Demo Author",
        email: "demo-author@example.com",
        password: "password",
        role: "editor",
      },
    })
  }

  // Find or create Technology category
  let technologyCategory
  const existingCategories = await payload.find({
    collection: "categories",
    where: {
      title: {
        equals: "Technology",
      },
    },
    limit: 1,
  })

  if (existingCategories.docs.length > 0) {
    technologyCategory = existingCategories.docs[0]
    payload.logger.info(`— Using existing Technology category...`)
  } else {
    payload.logger.info(`— Creating Technology category...`)
    technologyCategory = await payload.create({
      collection: "categories",
      data: {
        title: "Technology",
        description: "Articles about technology trends and innovation",
        breadcrumbs: [
          {
            label: "Technology",
            url: "/technology",
          },
        ],
      },
    })
  }

  // Create placeholder media for hero images
  payload.logger.info(`— Skipping image creation (will add later)...`)

  // Use null for hero images temporarily to avoid upload issues
  const heroImage1 = null
  const heroImage2 = null
  const heroImage3 = null

  payload.logger.info(`— Creating posts...`)

  // Create posts sequentially to maintain order
  const post1Doc = await payload.create({
    collection: "posts",
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: createDigitalTransformationPost({
      heroImage: heroImage1,
      author: demoAuthor,
      categoryId: technologyCategory.id,
    }),
  })

  const post2Doc = await payload.create({
    collection: "posts",
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: createAnalyticsStrategyPost({
      heroImage: heroImage2,
      author: demoAuthor,
      categoryId: technologyCategory.id,
    }),
  })

  const post3Doc = await payload.create({
    collection: "posts",
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: createScalingInfrastructurePost({
      heroImage: heroImage3,
      author: demoAuthor,
      categoryId: technologyCategory.id,
    }),
  })

  // Update posts with related posts
  payload.logger.info(`— Setting up related posts...`)
  await payload.update({
    id: post1Doc.id,
    collection: "posts",
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })

  await payload.update({
    id: post2Doc.id,
    collection: "posts",
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })

  await payload.update({
    id: post3Doc.id,
    collection: "posts",
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
  })

  payload.logger.info("Posts seeded successfully!")
}
