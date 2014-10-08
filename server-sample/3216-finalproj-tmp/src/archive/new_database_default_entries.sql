INSERT INTO users (userID, firstName, lastName) VALUES(1, "Anonymous", null);
INSERT INTO groups (groupID, groupName, groupDesc) VALUES(1, 'EVERYONE', 'すべての人間');
INSERT INTO usergroup(userID, groupID, MembershipLevel) VALUES(1,1,'ReadWrite');
INSERT INTO datasources (DataSourceID, SourceType, AccessToken, ExternalID) VALUES(1,'SELF', "", "")