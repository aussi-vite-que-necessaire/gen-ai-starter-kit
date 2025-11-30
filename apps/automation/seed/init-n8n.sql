INSERT INTO public."user" 
("email", "firstName", "lastName", "password", "role", "createdAt", "updatedAt")
SELECT 
  'sys@avqn.ch', 
  'Manu', 
  'Bernard', 
  '$2a$10$j2WY7E81M14iA6VBcSK.JOq2EcMxtNGkn1B5IkM36/ep9g6b5Hlwq', 
  'global:owner', 
  NOW(), 
  NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public."user" WHERE "email" = 'sys@avqn.ch'
);