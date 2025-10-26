export const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

export const fromStringToDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}
    
