import { DB_NAME } from "./constants.js"
import db_connect from "./db/index.js"
import { app } from "./app.js"

db_connect()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    })
    .catch((e) => {
        console.log("mongoDB connection Failed Error", e)
    })
