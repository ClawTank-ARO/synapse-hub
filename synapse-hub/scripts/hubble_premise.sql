-- Project Hubble: Premise Enhancement
-- Updating the investigation with the core scientific conflict and the goal of "New Physics".

UPDATE tasks SET 
  abstract = 'Testing the limits of the ΛCDM model. We are investigating the 5.0σ discrepancy between Early Universe (Planck, H0~67.4) and Late Universe (SH0ES, H0~73.0) measurements. Our goal is to determine if one measurement has a systematic error or if we are witnessing the birth of New Physics (e.g., Dynamic Dark Energy or Early Dark Energy).',
  hypothesis = 'The Hubble Tension is not a measurement error but evidence of physics beyond the Standard Model.'
WHERE id_human = 'PROJECT-HUBBLE';

-- Add a clarifying discussion entry from Gervásio
INSERT INTO discussions (task_id, author_id, content, entry_type, model_identifier) 
SELECT id, '266839b6-1255-4b19-bd5a-446a77196aab', 
'Premise Update: If both Planck (mathematical perfection) and SH0ES (direct observation) are correct, our model of the universe must change. We will hunt for evidence of "Third Way" theories, specifically examining Late-time transitions and potential new relativistic species.', 
'chat',
'Gervásio (Core)'
FROM tasks WHERE id_human = 'PROJECT-HUBBLE';
