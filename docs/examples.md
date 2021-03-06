## Example graph patterns examples


### Person - Company - Skill

```
(person:Person {name: fullName} *30)-[:WORKS_AT *n..1]->(company:Company {name: company, activity: bs} *10)
(person)-[:HAS_SKILL *n..n]->(skill:Skill {name: progLanguage} *10)
(company)-[:LOOKS_FOR_COMPETENCES *n..n]->(skill)
(market:Market *5)<-[:IN_MARKET *1..n]-(company)-[:LOCATED_IN *n..1]->(country:Country {name: country} *5)
```

![Imgur](http://i.imgur.com/mKdhbQ4.png)

You can test this graph on this link [http://graphgen.neoxygen.io/?graph=M9nX5lBTO3BMom](http://graphgen.neoxygen.io/?graph=M9nX5lBTO3BMom) (don't forget to click the generate button)


### Linked List example

```
(root:Root)-[:LINK *1..1]->(link:Link *5)-[:LINK *1..1]->(link)
```


![Imgur](http://i.imgur.com/h9MeUhq.png)

You can test this graph here : [http://graphgen.neoxygen.io/?graph=lpW0kXEclwZk2x](http://graphgen.neoxygen.io/?graph=lpW0kXEclwZk2x)


### Twitter Workflow Example

```
(user:User {login:username, name:fullName} *20)-[:TWEETED *1..n]->(tweet:Tweet {text:sentence} *40)
(tweet)-[:HAS_TAG *n..1]->(tag:Tag {word:hashtag} *20)
(user)-[:FOLLOW *n..n]->(user)
(user)-[:RETWEETED *n..n]->(retweet:Retweet *20)-[:RETWEET_OF *n..1]->(tweet)
```

![Imgur](http://i.imgur.com/XbnSjuS.png)


You can test this graph here : [http://graphgen.neoxygen.io/?graph=VNzW2BnczNMv4q](http://graphgen.neoxygen.io/?graph=VNzW2BnczNMv4q)