import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define types for our data structures
interface ParsedYear {
  value: number;
  era: 'BBY' | 'ABY';
  uncertain: boolean;
}

interface YearRange {
  start: number;
  end: number;
  era: 'BBY' | 'ABY';
}

interface Media {
  id: string;
  year: string;
  title: string;
  type: string;
  link: string;
  releaseDate: string;
  parsedYear: ParsedYear;
}

interface Era {
  id: string;
  yearRange: YearRange;
  title: string;
  image: string;
  index: number;
  media: Media[];
}

interface TimelineData {
  eras: Era[];
}

interface TranslationData {
  timeline: {
    [key: string]: {
      title: string;
      year?: string;
      // Add more fields here as needed for future translations
    };
  };
}

/**
 * Generates translation files from timeline data
 * @param sourceFile Path to the source timeline JSON file
 * @param outputFile Path to the output translation file
 * @param fieldsToTranslate Array of fields to include in translation file
 */
function generateTranslationFile(
  sourceFile: string,
  outputFile: string,
  fieldsToTranslate: string[] = ['title']
): void {
  try {
    // Check if the file exists
    if (!fs.existsSync(sourceFile)) {
      console.error(`Error: File not found: ${sourceFile}`);
      process.exit(1);
    }

    // Read the timeline data
    const fileContent = fs.readFileSync(sourceFile, 'utf8');
    const timelineData: TimelineData = JSON.parse(fileContent);

    // Create the translation structure
    const translationData: TranslationData = {
      timeline: {},
    };

    // Extract the fields to translate from each era
    timelineData.eras.forEach((era) => {
      translationData.timeline[era.id] = {} as any;

      // Only include specified fields
      fieldsToTranslate.forEach(field => {
        if (field in era) {
          // Use type assertion to handle the dynamic field access
          const fieldKey = field as keyof Era;
          (translationData.timeline[era.id] as any)[field] = era[fieldKey];
        }
      });

      // Add formatted year range
      if (fieldsToTranslate.includes('year') || fieldsToTranslate.includes('yearRange')) {
        const { start, end, era: eraType } = era.yearRange;
        const yearStr = `${start.toLocaleString()} – ${end.toLocaleString()} ${eraType}`;
        translationData.timeline[era.id].year = yearStr;
      }
    });

    // Ensure the output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the translation file
    fs.writeFileSync(
      outputFile,
      JSON.stringify(translationData, null, 2),
      'utf8'
    );

    console.log(`Translation file generated at: ${outputFile}`);
  } catch (error) {
    console.error('Error generating translation file:', error);
    process.exit(1);
  }
}

// Define paths relative to project root
const projectRoot = path.resolve(__dirname, '..');
const sourceFile = path.join(projectRoot, 'src/data/full_timeline.json');
const outputFile = path.join(projectRoot, 'src/i18n/locales/en.json');

// Generate the translation file with title and year fields
generateTranslationFile(sourceFile, outputFile, ['title', 'year']);

// Log a success message
console.log('Translation generation complete!');
