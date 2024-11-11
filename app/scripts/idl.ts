const fs = require('fs')
const idl = require('../constants/idl/monolith.json')


async function updateIdl() {
  const updatedIdl = `export type IDL = ${JSON.stringify(idl)}\n
export const IDL: IDL = ${JSON.stringify(idl)}
`

  fs.writeFileSync('./constants/idl/index.ts', updatedIdl)
}

void updateIdl()
