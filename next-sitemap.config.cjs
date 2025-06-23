/** @type {import('next-sitemap').IConfig} */

// Dynamic configuration generated from our SITEMAP_CONFIG
const {
  generateNextSitemapConfig,
} = require("./src/lib/sitemaps/next-sitemap-integration.js")

module.exports = generateNextSitemapConfig()
