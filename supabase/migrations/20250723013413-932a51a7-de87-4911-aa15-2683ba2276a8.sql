-- CORREÇÃO DA FUNÇÃO is_doctor_available

CREATE OR REPLACE FUNCTION public.is_doctor_available(p_medico_id integer, p_data_hora timestamp without time zone, p_consulta_id integer DEFAULT NULL::integer)
RETURNS boolean 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_dia_semana TEXT;
  v_disponivel BOOLEAN := FALSE;
  v_conflito BOOLEAN := FALSE;
  v_debug_info TEXT;
BEGIN
  -- Mapear dia da semana em português
  v_dia_semana := CASE EXTRACT(DOW FROM p_data_hora)
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda-feira'
    WHEN 2 THEN 'terça-feira'
    WHEN 3 THEN 'quarta-feira'
    WHEN 4 THEN 'quinta-feira'
    WHEN 5 THEN 'sexta-feira'
    WHEN 6 THEN 'sábado'
  END;

  -- Debug: criar log do que está sendo verificado
  v_debug_info := format('Verificando disponibilidade: medico=%s, data=%s, dia_semana=%s, hora=%s', 
                        p_medico_id, p_data_hora, v_dia_semana, p_data_hora::TIME);
  
  RAISE NOTICE '%', v_debug_info;

  -- Verificar se existe horário disponível para o médico no dia da semana
  SELECT EXISTS (
    SELECT 1 FROM public.horarios_disponiveis hd
    WHERE hd.id_medico = p_medico_id
      AND LOWER(TRIM(hd.dia_semana)) = LOWER(TRIM(v_dia_semana))
      AND p_data_hora::TIME >= hd.hora_inicio::TIME 
      AND p_data_hora::TIME <= hd.hora_fim::TIME
  ) INTO v_disponivel;

  RAISE NOTICE 'Horário disponível: %', v_disponivel;

  -- Verificar se há conflito com consultas existentes
  SELECT EXISTS (
    SELECT 1 FROM public.consultas c
    WHERE c.id_medico = p_medico_id
      AND c.status NOT IN ('cancelada', 'finalizada')
      AND (p_consulta_id IS NULL OR c.id != p_consulta_id)
      AND DATE(c.data_hora) = DATE(p_data_hora)
      AND ABS(EXTRACT(EPOCH FROM (c.data_hora - p_data_hora))) < 1800 -- 30 minutos
  ) INTO v_conflito;

  RAISE NOTICE 'Conflito encontrado: %', v_conflito;
  RAISE NOTICE 'Resultado final: %', (v_disponivel AND NOT v_conflito);

  RETURN v_disponivel AND NOT v_conflito;
END;
$$;