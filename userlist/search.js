const search = async (body, client) => {
    try {
        //WHERE
        let queryArr = ["offer IS NOT NULL", "", ""]
        /*if (body.search) {
            queryArr[0] = `(username SIMILAR TO '${body.search}%' OR name SIMILAR TO '${body.search}%')`
        }*/
        if (body.categories) {
            const str = body.categories.map((c) => `offer SIMILAR TO '%"${c}"%'`)
            queryArr[1] = str.join(" AND ")
        }
        if (body.language) {
            const str = body.language.map((l) => `(language SIMILAR TO '${l}' OR "otherlanguages" SIMILAR TO '%"${l}"%')`)
            queryArr[2] = `(${str.join(" OR ")})`
        }
        const whereStr = `WHERE ${queryArr.filter(q => q !== "").join(" AND ")}`

        //ORDER BY
        const weights = [2, 2, 1] //Starts with, Username Similarity, Name Similarity
        let orderStr = "ORDER BY "
        if (body.search) {
            orderStr += `(username SIMILAR TO '${body.search}%' OR LOWER(UNACCENT(name)) SIMILAR TO '${body.search}%')::int * ${weights[0]} + SIMILARITY(username,'${body.search}') * ${weights[1]} + SIMILARITY(name,'${body.search}') * ${weights[2]} DESC, `
        }
        orderStr += `LENGTH(username) ASC, username ASC, LENGTH(offer) DESC NULLS LAST`

        //QUERY
        const queryStr = `SELECT username, name, offer, language, otherlanguages FROM users ${whereStr} ${orderStr} LIMIT ${body.limit || 20}`
        console.log(queryStr)


        const { rows } = await client.query(queryStr)
        client.release()

        return {
            rows: rows
        }
    } catch (e) {
        return {
            statusCode: e.status || 500,
            error: e.message
        }
    }
}

module.exports = { search }