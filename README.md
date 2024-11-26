# ASR

Active Staking Rewards, inspired by [vote.jup.ag](https://vote.jup.ag/).

## Introduction

This program is a heavily-modified version of my previous hackathon winning [dao program](https://github.com/mael-bomane/dao).

Previously : 
- 10mb account size limit = max ~ 320k votes + deposits all users combined per project (max 32k users /w 10 votes per project)
- no voting rewards
- no token lock

Now :
- 10mb account size limit = max ~ 380k votes per user (unlimited users per project)
- voting rewards
- configurable token lock : mint, symbol, name, voting period, season duragion, approval threshold, quorum, min to start proposal, optional council, etc..
