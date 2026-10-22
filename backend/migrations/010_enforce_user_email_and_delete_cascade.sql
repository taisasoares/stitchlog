DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM users
        GROUP BY LOWER(email)
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Não é possível aplicar a migration: existem e-mails de usuários duplicados sem diferenciar maiúsculas e minúsculas.'
            USING ERRCODE = 'unique_violation';
    END IF;
END;
$$;

CREATE UNIQUE INDEX users_email_lower_key ON users (LOWER(email));

ALTER TABLE recipes
    DROP CONSTRAINT recipes_user_id_fkey,
    ADD CONSTRAINT recipes_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE;
