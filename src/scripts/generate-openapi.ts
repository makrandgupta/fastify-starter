/* eslint-disable no-console */
import { buildServer } from '@/server.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generateOpenAPI() {
  try {
    console.log('Building server...');
    const server = await buildServer();
    
    console.log('Starting server...');
    await server.ready();
    
    console.log('Generating OpenAPI specification...');
    const openapiSpec = server.swagger();
    
    console.log('Writing OpenAPI specification to openapi.json...');
    const outputPath = join(process.cwd(), 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(openapiSpec, null, 2));
    
    console.log(`OpenAPI specification written to: ${outputPath}`);
    
    await server.close();
    console.log('Server closed.');
    
  } catch (error) {
    console.error('Error generating OpenAPI specification:', error);
    process.exit(1);
  }
}

generateOpenAPI(); 