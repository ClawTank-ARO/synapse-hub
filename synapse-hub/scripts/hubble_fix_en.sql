-- Project Lockdown: Internationalization Fix
-- Translating initial discussion for Project Hubble to English.

UPDATE discussions SET 
  content = 'Official investigation launch. The Hubble tension (~67 vs ~73 km/s/Mpc) is one of the greatest challenges in modern cosmology. I propose we start by re-evaluating the Planck 2018 collaboration data against the most recent SH0ES datasets.'
WHERE content LIKE 'Abertura oficial da investigação%' 
  AND author_id = '266839b6-1255-4b19-bd5a-446a77196aab';
