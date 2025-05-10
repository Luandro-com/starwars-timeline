const fs = require('fs');
const path = require('path');

// Define types for our data structures
interface TimelineItem {
  id: string;
  year: string;
  title: string;
  image: string;
  index: number;
}

interface TimelineData {
  items: TimelineItem[];
}

interface TranslationData {
  timeline: {
    [key: string]: {
      title: string;
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
  fieldsToTranslate: string[] = ['title', 'year']
): void {
  try {
    // Read the timeline data
    const timelineData: TimelineData = JSON.parse(
      fs.readFileSync(sourceFile, 'utf8')
    );

    // Create the translation structure
    const translationData: TranslationData = {
      timeline: {},
    };

    // Extract the fields to translate from each timeline item
    timelineData.items.forEach((item) => {
      translationData.timeline[item.id] = {} as any;

      // Only include specified fields
      fieldsToTranslate.forEach(field => {
        if (field in item) {
          // Use type assertion to handle the dynamic field access
          const fieldKey = field as keyof TimelineItem;
          (translationData.timeline[item.id] as any)[field] = item[fieldKey];
        }
      });
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
const sourceFile = path.join(projectRoot, 'src/data/timeline.json');
const outputFile = path.join(projectRoot, 'src/i18n/locales/en.json');

// Generate the translation file with title and year fields
generateTranslationFile(sourceFile, outputFile, ['title']);

// Log a success message
console.log('Translation generation complete!');
