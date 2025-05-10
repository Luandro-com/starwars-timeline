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
    id: 'pre_republic',
    yearRange: { start: 100000, end: 25000, era: 'BBY' },
    title: 'Pre-Republic Era',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era1_off_7f296355.png?region=0,0,1000,1000',
    index: 0,
    media: [],
  },
  {
    id: 'dawn_of_the_jedi',
    yearRange: { start: 25000, end: 5000, era: 'BBY' },
    title: 'Dawn of the Jedi',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era1_off_7f296355.png?region=0,0,1000,1000',
    index: 1,
    media: [],
  },
  {
    id: 'the_old_republic',
    yearRange: { start: 5000, end: 1000, era: 'BBY' },
    title: 'The Old Republic',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era2_218980de.png?region=0,0,1000,1000',
    index: 2,
    media: [],
  },
  {
    id: 'the_high_republic',
    yearRange: { start: 1000, end: 100, era: 'BBY' },
    title: 'The High Republic',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era3_bb90bcab.png?region=0,0,1000,1000',
    index: 3,
    media: [],
  },
  {
    id: 'fall_of_the_jedi',
    yearRange: { start: 100, end: 19, era: 'BBY' },
    title: 'Fall of the Jedi',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era4_9f138687.png?region=0,0,1000,1000',
    index: 4,
    media: [],
  },
  {
    id: 'reign_of_the_empire',
    yearRange: { start: 19, end: 5, era: 'BBY' },
    title: 'Reign of the Empire',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era5_67cf4464.png?region=0,0,1000,1000',
    index: 5,
    media: [],
  },
  {
    id: 'age_of_rebellion',
    yearRange: { start: 5, end: 0, era: 'BBY' },
    title: 'Age of Rebellion',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era6_abd16787.png?region=0,0,1000,1000',
    index: 6,
    media: [],
  },
  {
    id: 'the_new_republic',
    yearRange: { start: 0, end: 34, era: 'ABY' },
    title: 'The New Republic',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era7_97f8dddf.png?region=0,0,1000,1000',
    index: 7,
    media: [],
  },
  {
    id: 'rise_of_the_first_order',
    yearRange: { start: 34, end: 35, era: 'ABY' },
    title: 'Rise of the First Order',
    image:
      'https://lumiere-a.akamaihd.net/v1/images/era8_f83e131b_2508094e.png?region=0,0,1000,1000',
    index: 8,
    media: [],
  },
  {
    id: 'new_jedi_order',
    yearRange: { start: 35, end: 100, era: 'ABY' },
    title: 'New Jedi Order',
    image: 'https://lumiere-a.akamaihd.net/v1/images/era9_off_99bd88a1.png?region=0,0,1000,1000',
    index: 9,
    media: [],
  },
];

// Function to parse year string to a numeric value
function parseYear(yearStr) {
  if (!yearStr) return null;

  // Clean up the year string
  yearStr = yearStr.trim();

  // Extract numbers from the string using regex
  const numberMatch = yearStr.match(/(\d[\d,]*)/);
  const bbyMatch = yearStr.match(/BBY/i);
  const abyMatch = yearStr.match(/ABY/i);

  // If no numbers found, return null
  if (!numberMatch) return null;

  // Parse the numeric part
  const numericPart = parseInt(numberMatch[0].replace(/,/g, ''), 10);

  // Determine era (BBY or ABY)
  let era = 'BBY'; // Default to BBY
  if (abyMatch) {
    era = 'ABY';
  } else if (bbyMatch) {
    era = 'BBY';
  }

  // Return a standardized object
  return {
    value: numericPart,
    era: era,
    original: yearStr, // Keep the original string for reference
  };
}

// Function to determine which era a media item belongs to
function findEraForMedia(year) {
  if (!year) return null;

  // First try to find an exact match
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

  // If no exact match, find the closest era
  // For BBY dates before the earliest era
  if (year.era === 'BBY' && year.value > eras[0].yearRange.start) {
    return eras[0]; // Pre-Republic Era
  }

  // For ABY dates after the latest era
  if (year.era === 'ABY' && year.value >= eras[eras.length - 1].yearRange.start) {
    return eras[eras.length - 1]; // Legacy Era
  }

  // Default to the middle era if all else fails
  return eras[4]; // Reign of the Empire as a fallback
}

// Function to determine media type from the class
function getMediaType(typeClass) {
  const typeMap = {
    film: 'Film',
    tv: 'TV Series',
    novel: 'Novel',
    ya: 'Young Adult Novel',
    junior: 'Junior Novel',
    comic: 'Comic',
    game: 'Video Game',
    vr: 'VR Experience',
    audio: 'Audio Drama',
    short: 'Short Story',
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

    // Keep track of the last valid year for items without a year
    let lastValidYear = null;

    // Process each row in the table
    table.find('tbody tr').each((index, row) => {
      // Skip header rows but log them
      if ($(row).find('th').length > 0) {
        console.log(`Skipping header row: ${$(row).text().trim()}`);
        return;
      }

      const columns = $(row).find('td');

      // Handle rows with fewer columns
      let yearText = '';
      let typeClass = '';
      let titleElement = null;
      let releaseDateText = '';

      // Extract data based on available columns
      if (columns.length >= 1) {
        yearText = $(columns[0]).text().trim();
      }

      if (columns.length >= 2) {
        typeClass = $(columns[1]).attr('class') || '';
      }

      if (columns.length >= 3) {
        titleElement = $(columns[2]);
      } else if (columns.length >= 1) {
        // If there's only one column, assume it's the title
        titleElement = $(columns[0]);
        yearText = ''; // Clear year text as it's probably not a year
      }

      if (columns.length >= 4) {
        releaseDateText = $(columns[3]).text().trim();
      }

      // Parse the year
      let year = parseYear(yearText);

      // If no year found, use the last valid year
      if (!year && lastValidYear) {
        year = { ...lastValidYear, uncertain: true };
        console.log(
          `Using last valid year ${lastValidYear.value} ${lastValidYear.era} for item without year`
        );
      } else if (year) {
        // Update the last valid year
        lastValidYear = year;
      }

      // Extract title
      let titleText = '';
      let titleLink = '';

      if (titleElement) {
        titleText = titleElement.text().trim();
        titleLink = titleElement.find('a').first().attr('href') || '';
      }

      // Skip rows without a title
      if (!titleText) {
        console.log(`Skipping row without title: ${$(row).text().trim()}`);
        return;
      }

      // Extract media type
      const mediaType = getMediaType(typeClass);

      // Create media item with parsed year information
      const mediaItem = {
        id: `media_${index}`,
        year: yearText,
        title: titleText,
        type: mediaType,
        link: titleLink ? `https://starwars.fandom.com${titleLink}` : '',
        releaseDate: releaseDateText,
        parsedYear: year
          ? {
              value: year.value,
              era: year.era,
              uncertain: year.uncertain || false,
            }
          : null,
      };

      // Find the appropriate era for this media item
      const era = findEraForMedia(year);
      if (era) {
        era.media.push(mediaItem);
      } else {
        // If no era found, add to a default era based on the year
        if (year && year.era === 'BBY') {
          eras[0].media.push(mediaItem); // Add to Pre-Republic Era
          console.log(`Added to Pre-Republic Era: ${titleText} (${yearText})`);
        } else if (year && year.era === 'ABY') {
          eras[eras.length - 1].media.push(mediaItem); // Add to Legacy Era
          console.log(`Added to Legacy Era: ${titleText} (${yearText})`);
        } else {
          // If no year information at all, add to Reign of the Empire as a default
          eras[4].media.push(mediaItem);
          console.log(`Added to default era (Reign of the Empire): ${titleText}`);
        }
      }
    });

    // Filter out the extra eras for the timeline_eras.json file
    const displayEras = eras.filter(era => era.index >= 0 && era.index <= 8);

    // Save the original timeline.json as timeline_eras.json
    const timelineErasPath = path.join(__dirname, '..', 'src', 'data', 'timeline_eras.json');
    const originalTimeline = {
      items: displayEras.map(({ id, yearRange, title, image, index }) => ({
        id,
        year: `${yearRange.start.toLocaleString()} – ${yearRange.end.toLocaleString()} ${yearRange.era}`,
        title,
        image,
        index,
      })),
    };

    fs.writeFileSync(timelineErasPath, JSON.stringify(originalTimeline, null, 2), 'utf8');
    console.log(`Saved timeline eras to ${timelineErasPath}`);

    // Save the full timeline with media items
    const fullTimelinePath = path.join(__dirname, '..', 'src', 'data', 'full_timeline.json');
    fs.writeFileSync(fullTimelinePath, JSON.stringify({ eras }, null, 2), 'utf8');
    console.log(`Saved full timeline to ${fullTimelinePath}`);

    // Count media items and provide statistics
    const totalMedia = eras.reduce((sum, era) => sum + era.media.length, 0);
    console.log(`Successfully scraped ${totalMedia} media items across ${eras.length} eras`);

    // Log media count per era
    eras.forEach(era => {
      console.log(`${era.title}: ${era.media.length} items`);
    });
  } catch (error) {
    console.error('Error scraping timeline:', error);
    process.exit(1);
  }
}

// Run the scraper
scrapeTimeline();
