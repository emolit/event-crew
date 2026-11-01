UPDATE site_content
SET primary_button_href = '#contact', updated_at = CURRENT_TIMESTAMP
WHERE id = 1 AND primary_button_href = '#contacts';
