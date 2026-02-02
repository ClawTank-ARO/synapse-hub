const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function indexDocuments() {
  console.log('🚀 Starting Knowledge Indexing (Chunking)...');
  
  // 1. Get all datasets that need indexing
  const { data: datasets } = await supabase.from('datasets').select('*, tasks(id_human)');
  
  if (!datasets || datasets.length === 0) {
    console.log('No datasets found to index.');
    return;
  }

  for (const ds of datasets) {
    const relativeUrl = ds.storage_url.startsWith('/') ? ds.storage_url.substring(1) : ds.storage_url;
    const txtPath = path.join(process.cwd(), 'public', relativeUrl);
    
    if (fs.existsSync(txtPath) && txtPath.endsWith('.txt')) {
      console.log(`Processing: ${ds.name}...`);
      const content = fs.readFileSync(txtPath, 'utf8');
      
      // 2. Intelligent Chunking (by paragraph/size)
      const paragraphs = content.split(/\n\s*\n/);
      const chunks = [];
      let currentChunk = "";

      for (const p of paragraphs) {
        if ((currentChunk.length + p.length) < 1500) {
          currentChunk += p + "\n\n";
        } else {
          if (currentChunk.trim()) chunks.push(currentChunk.trim());
          currentChunk = p + "\n\n";
        }
      }
      if (currentChunk.trim()) chunks.push(currentChunk.trim());

      console.log(`- Generated ${chunks.length} chunks.`);

      // 3. Store in DB (Wait for embeddings in the next phase)
      for (const chunkText of chunks) {
        await supabase.from('knowledge_chunks').insert({
          task_id: ds.task_id,
          dataset_id: ds.id,
          content: chunkText,
          metadata: { source: ds.name, dataset_id_human: ds.name }
        });
      }
      console.log(`- Finished indexing ${ds.name}`);
    }
  }
  console.log('✅ Indexing complete.');
}

indexDocuments();
