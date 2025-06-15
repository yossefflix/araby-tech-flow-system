
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sheetId, range, action } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Sheets API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (action === 'sync') {
      // جلب البيانات من Google Sheets
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rows = data.values;

      if (!rows || rows.length <= 1) {
        return new Response(JSON.stringify({ success: true, message: 'No new data to sync' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // تخطي الصف الأول (العناوين)
      const dataRows = rows.slice(1);
      let syncedCount = 0;

      for (const row of dataRows) {
        if (row.length >= 8) { // التأكد من وجود البيانات الأساسية
          // التحقق من عدم وجود الطلب مسبقاً
          const { data: existingOrder } = await supabaseClient
            .from('work_orders')
            .select('id')
            .eq('customer_name', row[1])
            .eq('phone', row[2])
            .eq('address', row[3])
            .single();

          if (!existingOrder) {
            // إضافة طلب جديد
            const { error } = await supabaseClient
              .from('work_orders')
              .insert({
                customer_name: row[1] || '',
                phone: row[2] || '',
                address: row[3] || '',
                property_number: row[4] || '',
                customer_complaint: row[5] || '',
                booking_date: row[6] ? new Date(row[6]).toISOString() : null,
                call_center_notes: row[7] || '',
                sap_number: row[8] || '',
                ac_type: row[9] || '',
                status: 'pending',
                created_by: 'Google Sheets Sync'
              });

            if (!error) {
              syncedCount++;
            }
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        syncedCount,
        totalRows: dataRows.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-google-sheets function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
