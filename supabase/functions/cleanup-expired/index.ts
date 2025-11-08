import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting cleanup of expired transfers...');

    // Get all expired transfers
    const { data: expiredTransfers, error: fetchError } = await supabase
      .from('transfers')
      .select('id')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired transfers:', fetchError);
      throw fetchError;
    }

    if (!expiredTransfers || expiredTransfers.length === 0) {
      console.log('No expired transfers found');
      return new Response(
        JSON.stringify({ message: 'No expired transfers to clean up', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredTransfers.length} expired transfers`);

    // Get all files for these transfers
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('storage_path')
      .in('transfer_id', expiredTransfers.map(t => t.id));

    if (filesError) {
      console.error('Error fetching files:', filesError);
      throw filesError;
    }

    // Delete files from storage
    if (files && files.length > 0) {
      console.log(`Deleting ${files.length} files from storage...`);
      const filePaths = files.map(f => f.storage_path);
      
      const { error: storageError } = await supabase.storage
        .from('transfers')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue anyway to clean up database records
      } else {
        console.log('Files deleted from storage successfully');
      }
    }

    // Delete transfer records (this will cascade delete file records)
    const { error: deleteError } = await supabase
      .from('transfers')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (deleteError) {
      console.error('Error deleting transfers:', deleteError);
      throw deleteError;
    }

    console.log(`Cleanup completed successfully. Removed ${expiredTransfers.length} transfers`);

    return new Response(
      JSON.stringify({ 
        message: 'Cleanup completed successfully',
        count: expiredTransfers.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
