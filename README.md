# ASR

Active Staking Rewards, inspired by [vote.jup.ag](https://vote.jup.ag/).

## Introduction

This program is a heavily-modified version of my previous hackathon winning [dao program](https://github.com/mael-bomane/dao).

Previously : 
- 10mb account size limit = max ~ 320k votes + deposits / project (max 32k users /w 10 votes per project)
- no voting rewards
- no token lock

Now :
- 10mb account size limit = max ~ 380k votes per user (unlimited users per project)
- voting rewards
- configurable token lock :

## Instructions

All instructions are heavily tested in [/tests]('/tests/asr.ts')

### initialize
