function wellDate(date) {
    const year = date.getFullYear(),
          month = (date.getMonth()+1).toString().padStart(2, '0'),
          day = (date.getDate()).toString().padStart(2, '0'),
          hours = (date.getHours()).toString().padStart(2, '0'),
          minutes = (date.getMinutes()).toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
