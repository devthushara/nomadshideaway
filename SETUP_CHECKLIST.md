# New Villa Setup Checklist

Use this checklist when deploying this template to a new villa.

## Step 1: Basic Villa Information ✓
- [ ] Update `config.json` → `villa.name`
- [ ] Update `config.json` → `villa.tagline`
- [ ] Update `config.json` → `villa.description`
- [ ] Update `config.json` → `villa.fullDescription`

## Step 2: Location & Contact ✓
- [ ] Update `config.json` → `location.address`
- [ ] Get Google Maps embed link and update `location.mapEmbed`
- [ ] Update `location.connectivity` with railway/transport info
- [ ] Update `config.json` → `contact.hosts` with names & phone numbers
- [ ] Add host photo as `img/ammanthaththa.jpg`

## Step 3: Images ✓
- [ ] Add villa logo as `img/logo.png`
- [ ] Add hero image (landscape) as referenced in `config.json` → `images.hero`
- [ ] Add gallery photos to `/img` folder
- [ ] Update `config.json` → `images.gallery` array with photo filenames
- [ ] Add partner logos:
  - `img/ridexhub_logo.webp` (or customize with own partner)
  - `img/MSCo_logs.png` (or customize with own partner)

## Step 4: Nearby Attractions ✓
- [ ] Research nearby beaches/attractions
- [ ] Create `beaches` array in `config.json` with:
  - Name, distance, travel time
  - Relevant emoji tags (🏄, 🌅, 🧘, etc.)
  - Unique description for each
  - Unsplash image URLs (or local images)

## Step 5: Hero Typewriter Effect ✓
- [ ] Select top 9 beaches/attractions for typewriter rotation
- [ ] Update `config.json` → `typewriterBeaches` array
- [ ] Verify emoji tags are descriptive (helps guests understand attraction type)

## Step 6: Partner Businesses ✓
- [ ] Identify 1-2 local businesses to partner with
- [ ] Update `config.json` → `partners` array:
  - Business name, category, logo path
  - Description and perks
  - Website URL
- [ ] Add partner logos to `/img` folder

## Step 7: OTA Integrations ✓
- [ ] Create listings on booking platforms:
  - [ ] Airbnb
  - [ ] Booking.com
  - [ ] Agoda
  - [ ] Trip.com (or alternatives)
- [ ] Update `config.json` → `otas` array with your listing URLs
- [ ] Update `netlify/functions/check-availability.js` with calendar URLs

## Step 8: Payment Setup ✓
- [ ] Create Stripe account
- [ ] Set up payment link for your villa nightly rate
- [ ] Update `config.json` → `stripe.paymentLink`
- [ ] Test payment flow in sandbox mode
- [ ] Verify pricing calculation: `basePricePerNight` and `directBookingDiscount`

## Step 9: Reviews Widget (Elfsight) ✓
- [ ] Create Elfsight account at elfsight.com
- [ ] Create new review widget
- [ ] Connect Booking.com account
- [ ] Connect Airbnb account
- [ ] Configure review display settings
- [ ] Get widget app ID
- [ ] Update `config.json` → `reviews.elfsightAppId`
- [ ] Wait 5-10 minutes for widget to populate

## Step 10: Design Customization ✓
- [ ] (Optional) Update color scheme in `index.html` CSS variables:
  - `--mango`: Primary color
  - `--leaf`: Accent color
  - `--railway`: Highlight color
  - `--sand`: Background color
- [ ] (Optional) Change fonts in `<head>` Google Fonts link
- [ ] (Optional) Update hero tagline in HTML

## Step 11: Deployment ✓
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Login to Netlify: `netlify login`
- [ ] Deploy: `netlify deploy --prod`
- [ ] Set custom domain in Netlify dashboard
- [ ] Update DNS records for custom domain
- [ ] Test on multiple devices (mobile, tablet, desktop)

## Step 12: Post-Deployment Tests ✓
- [ ] [ ] Test carousel - images display and rotate automatically
- [ ] [ ] Test typewriter effect - beaches rotate with emojis
- [ ] [ ] Click carousel images to open lightbox
- [ ] [ ] Test date picker for availability check
- [ ] [ ] Test partner links work correctly
- [ ] [ ] Check OTA links open correctly
- [ ] [ ] Verify reviews widget loads (may take 5-10 mins)
- [ ] [ ] Test on mobile viewport
- [ ] [ ] Test hamburger menu on mobile
- [ ] [ ] Verify map location is correct
- [ ] [ ] Test all external links work

## Step 13: SEO & Analytics ✓
- [ ] Update page title in `<title>` tag
- [ ] Update meta description in `<meta name="description">`
- [ ] Add Open Graph tags:
  - `og:title`
  - `og:description`
  - `og:image`
- [ ] Set up Google Analytics
- [ ] Set up Google Search Console
- [ ] Submit sitemap to search engines

## Step 14: Ongoing Maintenance ✓
- [ ] Monitor Elfsight dashboard weekly for new reviews
- [ ] Keep gallery images fresh (add new photos seasonally)
- [ ] Monitor booking availability across OTAs
- [ ] Track contact form inquiries
- [ ] Test availability checker monthly
- [ ] Update prices seasonally in `config.json`

## Optional Enhancements ✓
- [ ] Add FAQ section
- [ ] Add testimonials section
- [ ] Add sustainability/eco-friendly practices section
- [ ] Add house rules section
- [ ] Add video tour embed
- [ ] Add 360° virtual tour
- [ ] Set up email notifications for inquiries

## Quick Reference: Editable Files

**Only edit these files to customize for a new villa:**

1. **config.json** - ALL villa data (primary customization file)
2. **index.html** - Color scheme, fonts, layout (CSS section at top)
3. **netlify/functions/check-availability.js** - OTA calendar URLs
4. **/img** folder - All images
5. **TEMPLATE_README.md** - Update with your setup instructions

**Do NOT edit:**
- HTML structure (unless you know what you're doing)
- JavaScript logic (unless needed for custom features)
- CSS layout (only colors/fonts/spacing)

## Support

For questions about the template, refer to TEMPLATE_README.md

For villa-specific issues, contact the villa owner or property manager.
