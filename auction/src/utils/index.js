export const formatBalance = (rawBalance) => {
    const balance = (parseInt(rawBalance) / 1000000000000000000)
    return balance
}

export const time2Date = (time) => {
    // const dateTime = new Date().getTime() + time * 1000
    const date = new Date(time*1000)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// export const date2Time = (time) => {

// }