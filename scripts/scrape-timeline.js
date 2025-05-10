// Import required packages
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL to scrape
const URL = 'https://starwars.fandom.com/wiki/Timeline_of_canon_media';

// Define the eras from the existing timeline.json
const eras = [
  {
    id: "dawn_of_the_jedi",
    yearRange: { start: 25000, end: 5000, era: "BBY" },
    title: "Dawn of the Jedi",
    image: "https://lumiere-a.akamaihd.net/v1/images/era1_off_7f296355.png?region=0,0,1000,1000",
    index: 0,
    media: []
  },
  {
    id: "the_old_republic",
    yearRange: { start: 5000, end: 1000, era: "BBY" },
    title: "The Old Republic",
    image: "https://lumiere-a.akamaihd.net/v1/images/era2_218980de.png?region=0,0,1000,1000",
    index: 1,
    media: []
  },
  {
    id: "the_high_republic",
    yearRange: { start: 1000, end: 100, era: "BBY" },
    title: "The High Republic",
    image: "https://lumiere-a.akamaihd.net/v1/images/era3_bb90bcab.png?region=0,0,1000,1000",
    index: 2,
    media: []
  },
  {
    id: "fall_of_the_jedi",
    yearRange: { start: 100, end: 19, era: "BBY" },
    title: "Fall of the Jedi",
    image: "https://lumiere-a.akamaihd.net/v1/images/era4_9f138687.png?region=0,0,1000,1000",
    index: 3,
    media: []
  },
  {
    id: "reign_of_the_empire",
    yearRange: { start: 19, end: 5, era: "BBY" },
    title: "Reign of the Empire",
    image: "https://lumiere-a.akamaihd.net/v1/images/era5_67cf4464.png?region=0,0,1000,1000",
    index: 4,
    media: []
  },
  {
    id: "age_of_rebellion",
    yearRange: { start: 5, end: 0, era: "BBY" },
    title: "Age of Rebellion",
    image: "https://lumiere-a.akamaihd.net/v1/images/era6_abd16787.png?region=0,0,1000,1000",
    index: 5,
    media: []
  },
  {
    id: "the_new_republic",
    yearRange: { start: 0, end: 34, era: "ABY" },
    title: "The New Republic",
    image: "https://lumiere-a.akamaihd.net/v1/images/era7_97f8dddf.png?region=0,0,1000,1000",
    index: 6,
    media: []
  },
  {
    id: "rise_of_the_first_order",
    yearRange: { start: 34, end: 35, era: "ABY" },
    title: "Rise of the First Order",
    image: "https://lumiere-a.akamaihd.net/v1/images/era8_f83e131b_2508094e.png?region=0,0,1000,1000",
    index: 7,
    media: []
  },
  {
    id: "new_jedi_order",
    yearRange: { start: 35, end: 100, era: "ABY" },
    title: "New Jedi Order",
    image: "https://lumiere-a.akamaihd.net/v1/images/era9_off_99bd88a1.png?region=0,0,1000,1000",
    index: 8,
    media: []
  }
];

// Function to parse year string to a numeric value
function parseYear(yearStr) {
  if (!yearStr) return null;

  // Clean up the year string
  yearStr = yearStr.trim();

  // Check if it's a range (e.g., "34-35 ABY")
  if (yearStr.includes('-')) {
    // For ranges, we'll just take the first year
    yearStr = yearStr.split('-')[0].trim();
  }

  // Extract the numeric part and the era (BBY or ABY)
  const match = yearStr.match(/^([\d,]+)\s*(BBY|ABY)?$/i);
  if (!match) return null;

  const numericPart = parseInt(match[1].replace(/,/g, ''), 10);
  const era = (match[2] || '').toUpperCase();

  // Return a standardized object
  return {
    value: numericPart,
    era: era || 'BBY' // Default to BBY if not specified
  };
}

// Function to determine which era a media item belongs to
function findEraForMedia(year) {
  if (!year) return null;

  for (const era of eras) {
    const { start, end, era: eraType } = era.yearRange;

    // Check if the year's era matches the era's era type
    if (year.era === eraType) {
      // For BBY, higher numbers are earlier (e.g., 100 BBY is before 50 BBY)
      if (eraType === 'BBY' && year.value <= start && year.value > end) {
        return era;
      }
      // For ABY, lower numbers are earlier (e.g., 5 ABY is before 10 ABY)
      else if (eraType === 'ABY' && year.value >= start && year.value < end) {
        return era;
      }
    }
  }

  return null;
}

// Function to determine media type from the class
function getMediaType(typeClass) {
  const typeMap = {
    'film': 'Film',
    'tv': 'TV Series',
    'novel': 'Novel',
    'ya': 'Young Adult Novel',
    'junior': 'Junior Novel',
    'comic': 'Comic',
    'game': 'Video Game',
    'vr': 'VR Experience',
    'audio': 'Audio Drama',
    'short': 'Short Story'
  };

  return typeMap[typeClass] || 'Other';
}

// Main scraping function
async function scrapeTimeline() {
  try {
    console.log('Fetching timeline data from Wookieepedia...');
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    // Find the wikitable
    const table = $('.wikitable');

    // Check if table exists
    if (table.length === 0) {
      throw new Error('Could not find the timeline table on the page');
    }

    console.log('Parsing timeline data...');

    // Process each row in the table
    table.find('tbody tr').each((index, row) => {
      // Skip header rows
      if ($(row).find('th').length > 0) return;

      const columns = $(row).find('td');
      if (columns.length < 3) return; // Skip rows with insufficient data

      // Extract year
      const yearText = $(columns[0]).text().trim();
      const year = parseYear(yearText);

      // Extract media type
      const typeClass = $(columns[1]).attr('class') || '';
      const mediaType = getMediaType(typeClass);

      // Extract title
      const titleElement = $(columns[2]);
      const titleText = titleElement.text().trim();
      const titleLink = titleElement.find('a').first().attr('href') || '';

      // Extract release date
      const releaseDateText = $(columns[3]).text().trim();

      // Create media item
      const mediaItem = {
        id: `media_${index}`,
        year: yearText,
        title: titleText,
        type: mediaType,
        link: titleLink ? `https://starwars.fandom.com${titleLink}` : '',
        releaseDate: releaseDateText
      };

      // Find the appropriate era for this media item
      const era = findEraForMedia(year);
      if (era) {
        era.media.push(mediaItem);
      } else {
        console.log(`Could not find era for: ${titleText} (${yearText})`);
      }
    });

    // Save the original timeline.json as timeline_eras.json
    const timelineErasPath = path.join(__dirname, '..', 'src', 'data', 'timeline_eras.json');
    const originalTimeline = {
      items: eras.map(({ id, yearRange, title, image, index }) => ({
        id,
        year: `${yearRange.start.toLocaleString()} – ${yearRange.end.toLocaleString()} ${yearRange.era}`,
        title,
        image,
        index
      }))
    };

    fs.writeFileSync(
      timelineErasPath,
      JSON.stringify(originalTimeline, null, 2),
      'utf8'
    );
    console.log(`Saved timeline eras to ${timelineErasPath}`);

    // Save the full timeline with media items
    const fullTimelinePath = path.join(__dirname, '..', 'src', 'data', 'full_timeline.json');
    fs.writeFileSync(
      fullTimelinePath,
      JSON.stringify({ eras }, null, 2),
      'utf8'
    );
    console.log(`Saved full timeline to ${fullTimelinePath}`);

    // Count media items
    const totalMedia = eras.reduce((sum, era) => sum + era.media.length, 0);
    console.log(`Successfully scraped ${totalMedia} media items across ${eras.length} eras`);

  } catch (error) {
    console.error('Error scraping timeline:', error);
    process.exit(1);
  }
}

// Run the scraper
scrapeTimeline();
