SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema cs3216a1_schema
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `cs3216a1_schema` ;
CREATE SCHEMA IF NOT EXISTS `cs3216a1_schema` DEFAULT CHARACTER SET utf8 ;
USE `cs3216a1_schema` ;

-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`users` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`users` (
  `userID` BIGINT(64) UNSIGNED NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(45) NOT NULL,
  `lastName` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`userID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`datasources`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`datasources` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`datasources` (
  `DataSourceID` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `userID` BIGINT(64) UNSIGNED NULL DEFAULT NULL,
  `ExternalID` TEXT NOT NULL,
  `SourceType` VARCHAR(45) NOT NULL,
  `AccessToken` TEXT NOT NULL,
  `TokenExpiresBy` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`DataSourceID`),
  INDEX `userID_fk_idx` (`userID` ASC),
  CONSTRAINT `userID_fk`
    FOREIGN KEY (`userID`)
    REFERENCES `cs3216a1_schema`.`users` (`userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`issues`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`issues` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`issues` (
  `IssueID` BIGINT(64) UNSIGNED NOT NULL AUTO_INCREMENT,
  `IssueName` VARCHAR(45) NOT NULL,
  `startDate` DATETIME NULL DEFAULT NULL COMMENT 'StartDate for most intents and purposes defaults to deadline.',
  `endDate` DATETIME NULL DEFAULT NULL,
  `description` LONGTEXT NULL DEFAULT NULL,
  `dataSource` INT(10) UNSIGNED NOT NULL DEFAULT '0',
  `parentID` BIGINT(64) UNSIGNED NULL DEFAULT NULL,
  `idToken` BIGINT(64) UNSIGNED NULL DEFAULT NULL,
  `location` TEXT NULL DEFAULT NULL,
  `softdeadline` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`IssueID`),
  INDEX `parentId_idx` (`parentID` ASC),
  INDEX `dataSource_idx` (`dataSource` ASC),
  UNIQUE INDEX `idToken_UNIQUE` (`idToken` ASC),
  CONSTRAINT `dataSource`
    FOREIGN KEY (`dataSource`)
    REFERENCES `cs3216a1_schema`.`datasources` (`DataSourceID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `parentId`
    FOREIGN KEY (`parentID`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`groups`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`groups` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`groups` (
  `groupID` BIGINT(64) UNSIGNED NOT NULL AUTO_INCREMENT,
  `groupName` LONGTEXT NOT NULL,
  `groupDesc` LONGTEXT NULL DEFAULT NULL,
  `FBToken` BIGINT(64) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`groupID`),
  UNIQUE INDEX `FBToken_UNIQUE` (`FBToken` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 325
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`grouppermissions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`grouppermissions` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`grouppermissions` (
  `groupID` BIGINT(64) UNSIGNED NOT NULL,
  `issueID` BIGINT(64) UNSIGNED NOT NULL,
  `permissionLevel` ENUM('read','readWrite') NOT NULL DEFAULT 'read',
  PRIMARY KEY (`groupID`, `issueID`),
  INDEX `eventID_gp_fk_idx` (`issueID` ASC),
  CONSTRAINT `eventID_gp_fk`
    FOREIGN KEY (`issueID`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `groupID_gp_fk`
    FOREIGN KEY (`groupID`)
    REFERENCES `cs3216a1_schema`.`groups` (`groupID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`issuelog`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`issuelog` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`issuelog` (
  `IssueLogId` BIGINT(64) UNSIGNED NOT NULL AUTO_INCREMENT,
  `IssueId` BIGINT(64) UNSIGNED NOT NULL,
  `ActionType` VARCHAR(45) NOT NULL,
  `ActionDetails` TEXT NOT NULL,
  PRIMARY KEY (`IssueLogId`),
  INDEX `IssueId_fk_idx` (`IssueId` ASC),
  CONSTRAINT `IssueId_fk`
    FOREIGN KEY (`IssueId`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`issuerelation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`issuerelation` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`issuerelation` (
  `parentID` BIGINT(64) UNSIGNED NOT NULL,
  `childID` BIGINT(64) UNSIGNED NOT NULL,
  `relationType` ENUM('subIssue','relatedIssue') NOT NULL,
  PRIMARY KEY (`parentID`, `childID`),
  INDEX `eventIDc_ef_fk_idx` (`childID` ASC),
  CONSTRAINT `eventIDc_ef_fk`
    FOREIGN KEY (`childID`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `eventIDp_ef_fk`
    FOREIGN KEY (`parentID`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`issues_fb`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`issues_fb` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`issues_fb` (
  `IssueID` BIGINT(64) UNSIGNED NOT NULL AUTO_INCREMENT,
  `IssueName` LONGTEXT NOT NULL,
  `startDate` DATETIME NULL DEFAULT NULL COMMENT 'StartDate for most intents and purposes defaults to deadline.',
  `endDate` DATETIME NULL DEFAULT NULL,
  `description` LONGTEXT NULL DEFAULT NULL,
  `dataSource` VARCHAR(64) NOT NULL,
  `parentID` BIGINT(64) UNSIGNED NULL DEFAULT NULL,
  `rsvp` LONGTEXT NULL DEFAULT NULL,
  `idToken` BIGINT(64) UNSIGNED NULL DEFAULT NULL,
  `lastUpdated` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`IssueID`),
  UNIQUE INDEX `uq_twin` (`dataSource` ASC, `idToken` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 122
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`issuesmeta`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`issuesmeta` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`issuesmeta` (
  `IssueId` BIGINT(64) UNSIGNED NOT NULL,
  `RepeatStart` BIGINT(64) UNSIGNED NOT NULL,
  `RepeatEnd` BIGINT(64) UNSIGNED NULL DEFAULT NULL,
  `Repeat_Interval` INT(10) UNSIGNED NULL DEFAULT NULL,
  `Repeat_Year` INT(10) UNSIGNED NULL DEFAULT NULL,
  `Repeat_Month` INT(10) UNSIGNED NULL DEFAULT NULL,
  `Repeat_Week` INT(10) UNSIGNED NULL DEFAULT NULL,
  `Repeat_Day` INT(10) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`IssueId`),
  CONSTRAINT `Issues_ef_fk`
    FOREIGN KEY (`IssueId`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`softdeadlines`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`softdeadlines` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`softdeadlines` (
  `IssueID` BIGINT(64) UNSIGNED NOT NULL,
  `deadLine` DATETIME NOT NULL,
  PRIMARY KEY (`IssueID`),
  INDEX `eventID_sdl_fk_idx` (`IssueID` ASC),
  CONSTRAINT `eventID_sdl_fk`
    FOREIGN KEY (`IssueID`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`tags`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`tags` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`tags` (
  `tagName` VARCHAR(45) NOT NULL,
  `IssueID` BIGINT(64) UNSIGNED NOT NULL,
  PRIMARY KEY (`tagName`, `IssueID`),
  INDEX `eventID_tgs_fk_idx` (`IssueID` ASC),
  CONSTRAINT `eventID_tgs_fk`
    FOREIGN KEY (`IssueID`)
    REFERENCES `cs3216a1_schema`.`issues` (`IssueID`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `cs3216a1_schema`.`usergroup`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cs3216a1_schema`.`usergroup` ;

CREATE TABLE IF NOT EXISTS `cs3216a1_schema`.`usergroup` (
  `userID` BIGINT(64) UNSIGNED NOT NULL,
  `groupID` BIGINT(64) UNSIGNED NOT NULL,
  `MembershipLevel` ENUM('admin','readWrite','read') NOT NULL,
  `isSelfGroup` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`userID`, `groupID`),
  INDEX `groupID_fk_idx` (`groupID` ASC),
  CONSTRAINT `groupID_ug_fk`
    FOREIGN KEY (`groupID`)
    REFERENCES `cs3216a1_schema`.`groups` (`groupID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `userID_ug_fk`
    FOREIGN KEY (`userID`)
    REFERENCES `cs3216a1_schema`.`users` (`userID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
