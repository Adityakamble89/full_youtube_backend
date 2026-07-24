import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dns from "dns"

// Force Google/Cloudflare DNS to bypass router blocking MongoDB SRV lookups
dns.setServers(["8.8.8.8", "1.1.1.1"])
dns.setDefaultResultOrder("ipv4first")

const db_connect = async () => {
    try {
        const connectionresponce = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`mongodb is Connected ${connectionresponce.connection.host}`)

    } catch (e) {
        console.error("mongoDB connection Faild Error", e)
        process.exit(1)
    }
}
export default db_connect