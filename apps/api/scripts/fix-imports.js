#!/usr/bin/env node
// Post-build script to add .js extensions to relative imports in compiled JS files
import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

async function addJsExtensions(dir) {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
            await addJsExtensions(fullPath)
        } else if (entry.name.endsWith('.js')) {
            const content = await readFile(fullPath, 'utf-8')
            // Add .js to relative imports that don't already have it
            const updated = content.replace(
                /from\s+['"](\.\.?\/[^'"]+)(?<!\.js)['"]/g,
                'from "$1.js"'
            )

            if (content !== updated) {
                await writeFile(fullPath, updated, 'utf-8')
                console.log(`Fixed imports in ${fullPath}`)
            }
        }
    }
}

addJsExtensions('./dist').catch(console.error)
