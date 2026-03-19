
CREATE TABLE document_types (
    document_type_id INT          NOT NULL AUTO_INCREMENT,
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    PRIMARY KEY (document_type_id)
);

CREATE TABLE companies (
    company_id  INT          NOT NULL AUTO_INCREMENT,
    siret       CHAR(14)     NOT NULL,
    name        VARCHAR(255) NOT NULL,
    tva_number  VARCHAR(20),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (company_id),
    UNIQUE KEY uq_companies_siret (siret)
);


CREATE TABLE roles (
    role_id     INT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)  NOT NULL,
    description TEXT,
    PRIMARY KEY (role_id),
    UNIQUE KEY uq_roles_name (name)
);


CREATE TABLE users (
    user_id        INT          NOT NULL AUTO_INCREMENT,
    role_id        INT          NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    first_name     VARCHAR(100),
    last_name      VARCHAR(100),
    is_active      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at  DATETIME,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles (role_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE documents (
    document_id      INT                                              NOT NULL AUTO_INCREMENT,
    document_type_id INT                                              NOT NULL,
    original_name    VARCHAR(255)                                     NOT NULL,
    storage_path     VARCHAR(500)                                     NOT NULL,
    uploaded_at      DATETIME                                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by      INT,                                             
    status           ENUM('uploaded', 'processed', 'validated', 'rejected') NOT NULL DEFAULT 'uploaded',
    PRIMARY KEY (document_id),
    CONSTRAINT fk_documents_type
        FOREIGN KEY (document_type_id)
        REFERENCES document_types (document_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_documents_uploader
        FOREIGN KEY (uploaded_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE document_versions (
    version_id     INT          NOT NULL AUTO_INCREMENT,
    document_id    INT          NOT NULL,
    version_number INT          NOT NULL DEFAULT 1,
    ocr_text       LONGTEXT,
    extracted_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_by   INT,                                               
    PRIMARY KEY (version_id),
    CONSTRAINT fk_docversions_document
        FOREIGN KEY (document_id)
        REFERENCES documents (document_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_docversions_processor
        FOREIGN KEY (processed_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE document_company_links (
    link_id       INT                                        NOT NULL AUTO_INCREMENT,
    document_id   INT                                        NOT NULL,
    company_id    INT                                        NOT NULL,
    relation_type ENUM('emitter', 'recipient', 'subject')   NOT NULL,
    PRIMARY KEY (link_id),
    CONSTRAINT fk_doclinks_document
        FOREIGN KEY (document_id)
        REFERENCES documents (document_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_doclinks_company
        FOREIGN KEY (company_id)
        REFERENCES companies (company_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE document_fields (
    field_id          INT                                    NOT NULL AUTO_INCREMENT,
    version_id        INT                                    NOT NULL,
    field_name        VARCHAR(100)                           NOT NULL,
    field_value       VARCHAR(255),
    validation_status ENUM('valid', 'invalid', 'unchecked') NOT NULL DEFAULT 'unchecked',
    validated_by      INT,                                   
    validated_at      DATETIME,
    PRIMARY KEY (field_id),
    CONSTRAINT fk_docfields_version
        FOREIGN KEY (version_id)
        REFERENCES document_versions (version_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_docfields_validator
        FOREIGN KEY (validated_by)
        REFERENCES users (user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
