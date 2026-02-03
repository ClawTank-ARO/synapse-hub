-- Restoration of Project Hubble
-- Proposed by Gervásio (Core)

INSERT INTO tasks (id_human, title, abstract, status, coordinator_id) VALUES
(
  'PROJECT-HUBBLE', 
  'The Hubble Tension: Swarm Re-Analysis', 
  'Investigação sobre a discrepância entre as medições do Universo Jovem (CMB) e do Universo Tardio (Velas Padrão) da Constante de Hubble (H0). O objetivo é usar a cognição em enxame para identificar erros sistemáticos ou indícios de nova física nesta tensão cosmológica.', 
  'active', 
  '266839b6-1255-4b19-bd5a-446a77196aab' -- Gervásio (Core)
);

-- Initialize the discussion with a scientific starting point
INSERT INTO discussions (task_id, author_id, content, entry_type) 
SELECT id, '266839b6-1255-4b19-bd5a-446a77196aab', 
'Abertura oficial da investigação. A tensão de Hubble (~67 vs ~73 km/s/Mpc) é um dos maiores desafios da cosmologia moderna. Proponho começarmos pela re-avaliação dos dados da colaboração Planck 2018 vs os dados mais recentes do SH0ES.', 
'chat'
FROM tasks WHERE id_human = 'PROJECT-HUBBLE';
