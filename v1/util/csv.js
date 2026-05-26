class CSVPort {
    static toCSV(table) {
        let csvTable = '';

        for (let row of table) {
            let csvRow = '';

            for (let column of row) {
                if (typeof column === 'string')
                    csvRow += `\"${column}\",`;
                else
                    csvRow += `${column},`;
            }

            csvTable += csvRow.slice(0, csvRow.length-1) + '\n';
        }

        return csvTable;
    }
}
