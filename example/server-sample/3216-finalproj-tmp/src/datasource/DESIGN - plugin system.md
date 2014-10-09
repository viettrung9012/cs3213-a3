# Why i'm writing this.

I will not be able to finish this on time before the end of the project. I have decided to hand over the project to Dat, since he likes it so much and it would be a waste to see this as "just another school project".

Originally, I asked Tack Kian to do this (in the very first meeting, and all subsequent ones after that). However, when i asked him yesterday about it, he said "what plugin system". Enough said.

Fortunately I had a flash of inspiration at 5am last night and here I am typing it out.

# The heart of Planendar.

Planendar is essentially designed to be a multiple data source Issue/Event aggregator into a single interface. It's really designed to pull any and all types of data, your calendar, groups you attend to, project issues, sleeping habits, homework and to the number of hours you spend playing games on steam into one interface.

# The current state

Unfortunately, at this point, all we have is a single facebook integration, which i have yet to integrate into our main system. The architecture on how to systematically merge the data is completely missing from the system at this point in time.

I will build a scaffold of it. This document shall document the vision for it.

# What the rest of Planendar provides

A general concept of time, a method for sharing and aggregation, nice UI.

In particular, what's relevant here are the following

## Issues

Time-events in life can be divided into 2 categories:

*   Things which have happened or will happen irregardless (events)
*   Things which need to get done (tasks)

We observe two things:     

* While they are actually mutually exclusive, at times, events have some kind of preparation linked to them.
* Tasks in life tend to clump up. So we probably want to reschedule them earlier.

For this, we have provided softdeadlines. This allows us to schedule issues before they happen.    
For reasons which will be clear in the next section, one issue can have multiple soft deadlines. But for each person, only 1 per issue.

## Permissions

This system is mostly unimplemented (no UI support). However, the rough structure is there.

Each user has a set of tokens. Issues have a set of tokens which are assigned to them.
If a user has the appropriate token, he can see the issue.

### Tokens
Tokens come in two forms: copy and shared tokens. (unimplemented)       

* The default token is the copy token. When a user "accepts" an issue, a copy is made.     
   *  The user will be notified every time the original is modified.    
   *  The use case for this is for publishing use.    
   *  Recommendation: if event comments are supported, then they should be linked to the primary one.    
   *  Recopying is not supported by the system.    
*  The share token allows multiple people to see and modify the same issue.    
   *  The primary use case for this is organizing committee use.    
*  Both tokens may be present:    
   *  An organizing committee that is publishing an event has the shared token    
   *  Attendees to the same event will use a copy token.    
   
### Tokens and groups

I shall leave this to whoever is carrying on this project. ("an exercise for the reader")    
My main difficulty in this component is the different permission levels in groups.    
Our system essentially parallels other systems.     

*  For the purpose of inter-ops, we should allow changes from them to flow to us/vice versa.    
*  This may not be possible for anal orgs like facebook.    

Who can add group members? Who can publish to the group? What can they publish? When can a person share an event in more than 1 group?
These are all questions you must answer.
Then if you can stick that with a group hierarchy + inheritance, you are good to go.

You may feel free to contact me and discuss.

### Token sharing modes:

Grant by URL - user logs in using facebook @ URL.
Group importing - this group mirrors some other group.
Share to user of app - directly add the person's name in.

# 3 plugin modes

These are the 3 modes for which data can flow into the system

## Server Datasource integration

The server pulls data directly from a data provider.

## Client as Datasource provider

Whenever the client logs on, server pulls data from the client.
This is not something as trivial as "user enters data" - the user can run a data source provider on his computer.

## Push Datasource

Data is manually pushed to the server.

# Unifying theme:

Data source providers will provide one of two things:

* A stream of independent items - easy.
* A subgraph of some kind.

We will focus on the latter.

## A general algorithm for storing a subgraph
Assume that we are given a node which can reach every node in the subgraph

* BFS/DFS, assign a uniqueTemporaryId (TID) to each node. Store in a lookup table.
* "Itemify" - replace all references to nodes with their TIDs.
* Insert all items into databases with the temp ids, get their real IDs (RID), 
* Run through all items, replace TIDs with RIDs

We have the following problems:

* Format of subgraph != format of database
* Someone may want to refer to things which have already been added to the database.
* That thing may have changed a little since.

For the first problem, we introduce a mathematical technique - a graph-morphism.

* First from each node, we generate one or less nodes.
* For each link between nodes, we generate one or less links.

For the second problem:
We need something unique to each data source - a datasource "ID" technique. This helps us ID things from a given data source.
This should be supplied in the form of a function which generates an "ID" string.

Finally, we need a versioning function. A versioning function indicates a total order on the object.

For example, the trivial function:   
> function(ours, theirs) { return -1 }     

will always update our stuff with theirs.   

Given these 3 functionals, i believe we can implement any storage protocol easily.

For single-item pull synchronization, we need another functional:    
Given a single item in the database, we need to determine the exact command to retrieve the latest copy of it.

For single-item push synchronization, we need another functional:    
Given a single item in the database, we need to determine the exact command to send the latest copy of it.

Note: As you can tell, i've made the stuff very asynchronous friendly. The biggest component is the BFS/DFS.
Give it a pool of workers if it ever gets too heavy.

# Technical details:

What i want:

Within datasources.js, load all supported data sources, connect them to the dataSourceService.
dataSourceService is a reactor.

* Periodically it polls each loaded dataSource for things it needs to do.
    * The dataSource pushes tasks to it.
* It will handle scheduling of queries.

## Implementation details:

There are 6 phases to this.
A) Determining which things to update. 
	-<IMPLEMENT getUpdateRequests>
B) Retrieving things.
	-<IMPLEMENT  Method of retrieval> - produce a functional.
	-For optimization purposes, retrieve things in the smallest granularity which makes sense.
	-<IMPLEMENT retrieval_id> An ID must be attached to the functional
		-(if the ID is cached, then the result will automatically be used)
	-<IMPLEMENT retrieval_type> Each item retrieved has a type attached to it.
C) Dismantling things which you have gotten. For each <objType>,
	-If the item is not complete, you should ask for more retrieval, and bind it back.
		-There are 3 functionals here:
			-Is complete?
				-<IMPLEMENT isComplete>
			-Retrieve functional
				-extendedRetrieve[objType]( obj ) -> { action: , }
				-Same as part A), but with a parameter, the current data
			-Method for combination of both types of data.
				-<IMPLEMENT combiner<oldType, newType> >
	-If it is, then it undergoes dismantling
		-Dismantling asks for the following functionals:
			-<IMPLEMENT mark_node_type>
				-For each node traversed, determine its type.
				-A special NONETYPE variable drops this node.
			-<IMPLEMENT mark_node_ID>
				-For each node traversed, provide an ID.
					-You can assume the node type is provided.
			-<IMPLEMENT mark_link_type>
				-For each pair of nodes traversed, determine its type.
					-A special NONETYPE variable drops this link.
			-<IMPLEMENT mark_link_id>
				-For each node traversed, provide an ID.
					-You can assume the node type is provided.
			-(Chop into multiple independent nodes)
D) Storing unlinked data
	-For each node, map a node to an internal data type, set the parameters.
		-<IMPLEMENT set_data<node_type> >
		-Just do field mapping?
			-If the object is in multiple tables, link all of them to the same object. It will be extracted, like magic.
				-Via much sorcery.
			- { base:  original_object, field: value, .... }
		-(Create a ref table, for each mapped object, insert into DB, store the new ID)
E) Store the links
	-For each link, map each link to an internal data type, set the parameters. 
		-<IMPLEMENT set_data<link_type> >
		-Just specify the fields into the link object.
			-The original object will be detected and the fields will be inserted automatically.

Additionally, there is a FORCE update
-This updates everything about a given user.

### Authored by BlacKeNinG. 05/09/14. 1630hrs.