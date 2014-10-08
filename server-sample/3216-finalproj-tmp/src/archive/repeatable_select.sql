select issueID from issues where (startDate >= D1 and startDate <= D2) or (endDate >= D1 and endDate <= D2) or (startDate <= D1 and endDate >= D2) union
select issueID from issuesmeta where (repeatstart >= D1 and repeatstart <= D2) or (repeatend >= D1 and repeatend <= D2)
or (repeatstart <= D1 and (repeatend >= D1 or repeatend = null) and 
(ceil((D1-repeatstart)/repeat_interval) <= floor((D2-repeatstart)/repeat_interval)
or ceil((D1-repeatstart+((select endDate from issues where issues.issueID = issuesmeta.issueID) - (select startDate from issues where issues.issueID = issuesmeta.issueID)))/repeat_interval) <= floor((D2-repeatstart+((select endDate from issues where issues.issueID = issuesmeta.issueID) - (select startDate from issues where issues.issueID = issuesmeta.issueID)))/repeat_interval)
or (floor((D1-repeatstart)/repeat_interval) + ((select endDate from issues where issues.issueID = issuesmeta.issueID) - (select startDate from issues where issues.issueID = issuesmeta.issueID))/repeat_interval > (D2-repeatstart)/repeat_interval)
));