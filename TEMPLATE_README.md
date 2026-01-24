# Villa Booking Website Template

A premium, responsive single-page villa booking website template that works with multiple OTA platforms. Easily customizable for any villa through the `config.json` file.

## Quick Start for New Villa Setup

### 1. Edit `config.json`
All villa-specific data is stored in `config.json`. Simply edit this file to customize the website for a new villa:

```json
{
  "villa": {
    "name": "Your Villa Name",
    "tagline": "Your tagline here",
    "description": "Villa description"
  },
  "location": {
    "address": "Full address",
    "mapEmbed": "Google Maps embed URL"
  },
  "contact": {
    "hosts": [
      {
        "name": "Host Name",
        "phone": "+country code phone number"
      }
    ]
  },
  "pricing": {
    "basePricePerNight": 120,
    "directBookingDiscount": 0.15,
    "currency": "USD"
  },
  "images": {
    "logo": "img/your-logo.png",
    "hero": "img/your-hero-image.jpg",
    "gallery": [
      "img/photo1.jpg",
      "img/photo2.jpg"
    ]
  }
}
```

### 2. Update Images
Replace placeholder images in the `/img` folder:
- `logo.png` - Your villa logo
- `nomads_*.jpg` - Gallery photos (reference them in `config.json`)
- `ammanthaththa.jpg` - Host photo

### 3. Customize Beaches Section
Edit the `beaches` array in `config.json` to list nearby attractions:

```json
"beaches": [
  {
    "name": "Beach Name",
    "distance": "X KM",
    "time": "Y mins",
    "tags": ["🏄", "🌅"],
    "description": "Description...",
    "image": "https://unsplash-url.jpg"
  }
]
```

### 4. Customize Typewriter Effect
The hero section shows a rotating animation of nearby beaches. Update `typewriterBeaches` array:

```json
"typewriterBeaches": [
  {
    "name": "Beach Name",
    "distance": "X KM",
    "time": "Y mins",
    "tags": ["🏄", "🌅"]
  }
]
```

### 5. Partner Businesses
Add local businesses your villa partners with:

```json
"partners": [
  {
    "name": "Business Name",
    "category": "Business Type",
    "logo": "img/logo.png",
    "description": "...",
    "perks": ["Perk 1", "Perk 2"],
    "website": "https://...",
    "icon": "bike"
  }
]
```

### 6. OTA Links
Update links to your villa on booking platforms:

```json
"otas": [
  {
    "name": "Airbnb",
    "icon": "home",
    "url": "https://airbnb.com/your-listing"
  }
]
```

### 7. Setup Stripe Payment
Update the Stripe payment link in config:

```json
"stripe": {
  "paymentLink": "https://buy.stripe.com/YOUR_LINK"
}
```

### 8. Setup Elfsight Reviews
Update the Elfsight app ID for review aggregation:

```json
"reviews": {
  "elfsightAppId": "YOUR_APP_ID"
}
```

## Features

✨ **Responsive Design** - Works on desktop, tablet, and mobile
🏖️ **Beach Showcase** - Rotating typewriter effect with nearby attractions
🖼️ **Auto-Rotating Gallery** - Click images to enlarge them
📅 **Booking Calendar** - Integrated date picker with availability checking
⭐ **Live Reviews** - Aggregates reviews from Booking.com, Airbnb, and more via Elfsight
🤝 **Partner Integration** - Showcase local businesses with custom links
🎨 **Modern Design** - Glassmorphic UI with smooth animations
📱 **Mobile Optimized** - Touch-friendly navigation and touch-responsive carousel

## File Structure

```
/
├── index.html              # Main website (single page)
├── config.json            # All villa configuration data
├── img/                   # Images folder
│   ├── logo.png
│   ├── ammanthaththa.jpg  # Host photo
│   ├── nomads_*.jpg       # Gallery photos
│   ├── ridexhub_logo.webp # Partner logo
│   └── MSCo_logs.png      # Partner logo
├── netlify/
│   └── functions/
│       └── check-availability.js  # Serverless function for OTA sync
└── package.json           # Dependencies
```

## Customization Guide

### Colors
Edit CSS variables at the top of the `<style>` section in `index.html`:

```css
:root {
    --mango: #FFB347;      /* Primary color */
    --leaf: #2E8B57;       /* Accent color */
    --railway: #E63946;    /* Highlight color */
    --sand: #F9F7F2;       /* Background color */
    --text: #2C3E50;       /* Text color */
    --white: #ffffff;
}
```

### Fonts
Currently using:
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, modern)

Change in the `<link>` tags in `<head>` section.

### Navigation Links
Edit the nav links in the `<header>` element to match your sections.

## Backend Integration

The booking calendar syncs with 6 OTA platforms:
- Agoda
- VRBO
- Ctrip
- Your.rentals
- Booking.com
- Airbnb

Configure calendar URLs in the `check-availability.js` Netlify function.

## Deployment

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

The template includes:
- Serverless functions support
- Automatic HTTPS
- Global CDN
- Environment variables support

### Custom Domain
Update your domain DNS to point to Netlify's servers.

## SEO Optimization

Update in `index.html`:
- `<title>` tag
- Meta description
- Open Graph tags (og:title, og:description, og:image)

## Troubleshooting

**Carousel images not showing:**
- Check image paths in `config.json`
- Ensure images exist in `/img` folder
- Check browser console for 404 errors

**Typewriter effect not working:**
- Verify `config.json` is loading (check Network tab)
- Ensure `typewriterBeaches` array is not empty
- Check for JavaScript errors in console

**Reviews not showing:**
- Verify Elfsight app ID in `config.json`
- Check Elfsight dashboard is configured with your accounts
- Allow 5-10 minutes for widget to load

## Support for Multiple Villas

This template is designed to be easily duplicated for multiple villas:

1. Duplicate the entire folder
2. Edit `config.json` with new villa details
3. Replace images in `/img`
4. Deploy to a new domain

Each villa gets its own complete instance with customized content.

## License

This template is provided as-is for villa owners and property managers.

## Technologies Used

- **HTML5/CSS3** - Clean, semantic markup with modern styling
- **Vanilla JavaScript** - No frameworks, lightweight and fast
- **Flatpickr** - Calendar date picker
- **Lightbox2** - Image gallery modal
- **Lucide Icons** - Beautiful SVG icons
- **Elfsight** - Review aggregation widget
- **Netlify Functions** - Serverless backend
- **Stripe** - Payment processing
- **Google Maps** - Location embedding

---

For updates and support, refer to the main project repository.
