$(document).ready(function() {
    // CÁC HÀM XỬ LÝ PHẦN DOWNLOAD FILE JSON
    // -------------------------------------------
    // -------------------------------------------
    // -------------------------------------------

    // Hàm tổng hợp dữ liệu
    function gatherData() {
        let exec = $('#exec').val()
        let title = $('#title').val()
        let author = $('#author').val()
        let desc = $('#desc').val()
        let bgcolor = $('#bg-color').val()
        let color = $('#text-color').val()
        trealet = { exec: exec, title: title, author: author, desc: desc, bgcolor: bgcolor, color: color, items: items }
    }

    // Hàm tạo file
    function makeFile(text) {
        var text_data = new Blob([text], { type: 'text/plain' });
        if (json_file !== null) {
            window.URL.revokeObjectURL(json_file);
        }
        json_file = window.URL.createObjectURL(text_data);
        return json_file;
    }

    $('#save').click(function() {
        gatherData();
        let datastring = JSON.stringify({ trealet: trealet }, null, "\t");
        $("#download").attr("href", makeFile(datastring));
        $("#download").css("display", "block");
    })

    $('#new').click(function() {
        resetMainForm();
        resetItemForm();
        items = [];
        resetItemsListView();
    })

})