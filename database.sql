SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+1:00";
SET AUTOCOMMIT=0;
START TRANSACTION;

DROP DATABASE IF EXISTS autossl;
CREATE DATABASE IF NOT EXISTS autossl
  CHARACTER SET 'utf8'
  COLLATE 'utf8_general_ci';

USE autossl;

CREATE TABLE user (
	user_id int NOT NULL AUTO_INCREMENT,
	username varchar(36) NOT NULL,
	email varchar(255) NOT NULL,
	password varchar(43) NOT NULL,
	PRIMARY KEY (user_id)
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO user (username, email, password) values ("test", "test@test.test", "test");

CREATE TABLE server (
	server_id int NOT NULL AUTO_INCREMENT,
	user_id int NOT NULL,
	ip varchar(45) NOT NULL,
	server_name varchar(36) NOT NULL,
	PRIMARY KEY (server_id)
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO server (user_id, ip, server_name) values (1, "0.0.0.0", "test");

CREATE TABLE web_server (
	web_server_id int NOT NULL AUTO_INCREMENT,
	server_id int NOT NULL,
	web_server_name VARCHAR(255) NOT NULL,
	configuration_path VARCHAR(4096) NOT NULL,
	PRIMARY KEY (web_server_id)
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE domain (
	domain_id int NOT NULL AUTO_INCREMENT,
	web_server_id int NOT NULL,
	domain_name int(253) NOT NULL,
	PRIMARY KEY (domain_id)
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE certificate (
	certificate_id int NOT NULL AUTO_INCREMENT,
	provider varchar(36) NOT NULL,
	expiration_date DATE NOT NULL,
	PRIMARY KEY (certificate_id)
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE certificate_domain(
	certificate_id int NOT NULL,
	domain_id int NOT NULL
) CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- foreign key constraints

ALTER TABLE server
	ADD CONSTRAINT server_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE web_server
	ADD CONSTRAINT web_server_ibfk_1 FOREIGN KEY (server_id) REFERENCES server (server_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE domain
	ADD CONSTRAINT domain_ibfk_1 FOREIGN KEY (web_server_id) REFERENCES web_server (web_server_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE certificate_domain
	ADD CONSTRAINT certificate_domain_ibfk_1 FOREIGN KEY (certificate_id) REFERENCES certificate (certificate_id) ON DELETE CASCADE ON UPDATE CASCADE,
	ADD CONSTRAINT certificate_domain_ibfk_2 FOREIGN KEY (domain_id) REFERENCES domain (domain_id) ON DELETE CASCADE ON UPDATE CASCADE;

	






