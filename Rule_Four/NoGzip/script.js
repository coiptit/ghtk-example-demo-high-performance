var items = []
var trealet
var json_file = null

var update_item_index = -1;
const selected_btn_bg = "#ffccd2";
const selected_btn_text = "#ff6131";
const btn_bg = "#ffffff";
const btn_text = "#2d2b77";

const time_show_length = 10; // Time được hiện ra tối đa 10 ký tự
const id_show_length = 6 // Id hiện tối đa 6 ký tự

$(document).ready(function () {
    $('#show-main-form').prop('disabled', true)
    $('#download').css("display", "none")
    $('#update').hide()
    $('#cancel').hide()
    selectNavLi("#showoff")





    // CÁC HÀM RESET-------------------------------
    // --------------------------------------------
    // --------------------------------------------
    // Xóa dữ liệu đã được điền trong main form
    function resetMainForm() {
        $('#main-form input').val('')
        $('#main-form textarea').val('')
    }

    // Xóa dữ liệu đã được điền trong item form
    function resetItemForm() {
        $('.iinput').val('')
        resetImoreList()
    }

    // Xóa danh sách imore của item đang được nhập
    function resetImoreList() {
        $('#imore-input').val('')
        $('#imore-list').empty()
    }

    // Xóa danh sách hiện các items cũ
    function resetItemsListView() {
        $('#items-list-rows').empty()
    }





    // CHỈNH CSS PROPERTIES CHO CÁC BUTTON
    // -----------------------------------------
    // -----------------------------------------
    // -----------------------------------------
    // Chọn 1 button (thay đổi màu sắc button)
    function selectBtn(button) {
        $(button).css("background-color",selected_btn_bg)
        $(button).find('i').css("color", selected_btn_text)
    }

    // Bỏ chọn các edit button (sau khi edit và cập nhật xong, các nút edit sẽ được bỏ chọn)
    function nonSelectAllEditBtn() {
        update_item_index = -1
        $('.edit-item').css("background-color", btn_bg)
        $('.edit-item').find('i').css("color", btn_text)
        $('#update').hide()
        $('#cancel').hide()
        $('#add').show()
    }

    // Chọn nút ở navbar
    function selectNavLi(li) {
        $(li).css("border-bottom", "solid 3px skyblue")
    }

    function nonSelectNavLi(li) {
        $(li).css("border", "transparent")
    }





    // XỬ LÝ CHUỖI NHẬP VÀO
    // -------------------------------------------
    // -------------------------------------------
    // -------------------------------------------
    // Chuyển đổi 1 string về 1 số nguyên dương (nếu không hợp lệ trả về -1)
    function stringToNum(text) {
        text = text.replace(/\s/g, '')
        if (/^\d+$/.test(text)) {
            let num = parseInt(text)
            if (isNaN(num)) return -1;
            else if(num > 0) return num;
        }
        else return -1;
    }

    function isValidId(text) {
        if (text.length < 1) {
            return false
        }
        return stringToNum(text) > 0
    }

    function getStringLengthOf(length, str) {
        if (str.length <= length) {
            return str
        } else {
            return str.substring(0, length - 2) + ".."
        }
    }

    // THÊM, XÓA, 1 ITEM TRONG MẢNG ITEMS
    // --------------------------------------------------------
    // --------------------------------------------------------
    // --------------------------------------------------------
    // Thêm 1 item (id, time, idesc, more) vào danh sách các items
    function addItemByInfo(id, time, idesc, more) {
        let item = {
            image:id,
            time:time,
            idesc:idesc,
            more:more
        }
        items.push(item)
    }

    // Chèn item vào vị trí index trong danh sách items
    function insertItemAt(index, item) {
        items.splice(index, 0, item)
    }

    // Xóa 1 item tại vị trí index trong danh sách items (không phải item-view)
    function deleteItemByIndex(index) {
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
        }
    }





    // XỬ LÝ ITEM HTML: ĐỂ HIỆN, NHẬN THAO TÁC NGƯỜI DÙNG,..
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------

    // Đối với item
    // Lấy html biểu diễn 1 item (no, id, time) trong item list --> hiện item-view
    function getItemHtml(no, id, time) {
        id = getStringLengthOf(id_show_length, id)
        time = getStringLengthOf(time_show_length,time)
        let item_view = $(document.createElement('div')).prop({
            class: "horizontal item"
        })
        let no_label = $(document.createElement('LABEL')).prop({
            class: "item-no"
        })
        no_label.html(no.toString() + ".")
        
        let item_box = $(document.createElement('div')).prop({
            class: "horizontal item-box"
        })
        item_view.append(no_label, item_box)
        let item_info = $(document.createElement('div')).prop({
            class: "item-info"
        })
        let label_time = $(document.createElement('SPAN')).prop({
            class: "item-view-text"
        })
        label_time.html("Tiêu đề: ")
        let itime_info = $(document.createElement('SPAN')).prop({
            class: "itime-info"
        })
        itime_info.html(time)
        let label_id = $(document.createElement('SPAN')).prop({
            class: "item-view-text"
        })
        label_id.html("Id: ")
        let iid_info = $(document.createElement('SPAN')).prop({
            class: "itime-info"
        })
        iid_info.html(id)
        item_info.append(label_time, itime_info, label_id, iid_info)
        let btns_container = $(document.createElement('div')).prop({
            class: "horizontal small-buttons item-btns"
        })
        let delete_btn = $(document.createElement('button')).prop({
            type: "submit",
            class: "delete-item"
        })
        delete_btn.append('<i class="fas fa-trash"></i><span> Xóa</span>')
        let duplicate_btn = $(document.createElement('button')).prop({
            type: "submit",
            class: "duplicate-item"
        })
        duplicate_btn.append('<i class="fas fa-copy"></i><span> x2</span>')
        let edit_btn = $(document.createElement('button')).prop({
            type: "submit",
            class: "edit-item"
        })
        edit_btn.append('<i class="fas fa-edit"></i><span> Chỉnh sửa</span>')
        btns_container.append(delete_btn, duplicate_btn, edit_btn)
        item_box.append(item_info, btns_container)
        return item_view
    }

    // Thêm 1 item-view vào danh sách item-view (cho người dùng biết item vừa nhập đã được thêm)
    function addItemViewHtml(no, image, time) {
        $('#items-list-rows').append(getItemHtml(no, image, time))
    }

    // Hiện danh sách items
    function renderItemsListView() {
        resetItemsListView();
        nonSelectAllEditBtn();
        for (let i = 0; i < items.length; i++) {
            addItemViewHtml(i + 1, items[i].image, items[i].time)
        }
    }

    // Lấy số thứ tự của item trong danh sách các items
    function getIndexOfItem(item_view) {
        return item_view.closest('.item').index();
    }

    // Hiện 1 item[vị trí index trong danh sách item] ở item form (để xem chi tiết, chỉnh sửa)
    function showItemByIndex(index) {
        let item = items[index]
        resetItemForm();
        $('#iid').val(item.image)
        $('#itime').val(item.time)
        $('#idesc').val(item.idesc)
        showImoreList(item.more)
    }

    function getImoreHtml(iid) {
        let imore_div =  $(document.createElement('div')).prop({
            class: "imore"
        })

        let imore_text = $(document.createElement('span')).prop({
            class: "imore-text"
        })
        imore_text.append(iid)
        imore_div.append(imore_text)

        let del_imore_btn = $(document.createElement('a')).prop({
            class: "del-imore"
        })
        del_imore_btn.append('<i class="fas fa-minus"></i>')
        imore_div.append(del_imore_btn)
        return imore_div
    }

    function addImoreAction() {
        let imore = stringToNum($('#imore-input').val())
        if (imore > 0) {
            $('#imore-list').append(getImoreHtml(imore))
        } 
        $('#imore-input').val('')
    }

    function getImoreListVal() {
        let imore_list = []
        $('#imore-list .imore-text').each(function () {
            let imore = stringToNum($(this).text()).toString()
            imore_list.push(imore)
        })
        return imore_list
    }

    function showImoreList(imore_list) {
        resetImoreList()
        for (let imore of imore_list) {
            $('#imore-list').append(getImoreHtml(imore))
        }
    }




    // CÁC HÀM EVENT CỦA CÁC ĐỐI TƯỢNG HTML
    // -------------------------------------------------------
    // -------------------------------------------------------
    // -------------------------------------------------------

    $('#showoff').click(function () {
        nonSelectNavLi("#activities")
        selectNavLi("#showoff")
    })

    $('#activities').click(function () {
        nonSelectNavLi("#showoff")
        selectNavLi("#activities")
    })

    $('#hide-main-form').click(function () {
        $('#main-form .input-container').css('display', 'none')
        $(this).prop('disabled', true)
        $('#items-list-rows').height(315)
        $('#show-main-form').prop('disabled', false)
    })

    $('#show-main-form').click(function () {
        $('#main-form .input-container').css('display', 'flex')
        $(this).prop('disabled', true)
        $('#items-list-rows').height(150)
        $('#hide-main-form').prop('disabled', false)
    })

    $('#iid').keyup(function() {
        if ($('#iid').val().length > 0) {
            let id = stringToNum($('#iid').val())
            if (id <= 0) {
                
                $('#iid-noti').text('Id của file là một số. Bạn hãy kiểm tra và nhập lại')
                $('#iid-noti').show()
            } else {
                $('#iid-noti').hide()
                $('#iid-noti').text('')
            }

        } else {
            $('#iid-noti').hide()
            $('#iid-noti').text('')            
        }
    });

    $('#imore-input').keyup(function() {
        if ($('#imore-input').val().length > 0) {
            let imore = stringToNum($('#imore-input').val())
            if (imore <= 0) {
                $('#imore-noti').text('Id của file là một số. Bạn hãy kiểm tra và nhập lại')
                $('#imore-noti').show()
            } else {
                $('#imore-noti').hide()
                $('#imore-noti').text('')            
            }

        } else {
            $('#imore-noti').hide()
            $('#imore-noti').text('')            
        }
    });

    
    $('#imore-input').keyup(function(e) {
        if (e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });

    $('#imore-input').bind("enterKey",function(e) {
        addImoreAction()
    });

    $('#add-imore').click(function() {
        addImoreAction()
    })

    $('#clear-imore-list').click(function() {
        resetImoreList()
    })
    
    // Các button chính trong item form
    $('#clear').click(function () {
        resetItemForm()
    })

    $('#add').click(function () {
        // Item phải có id
        if (isValidId($('#iid').val())) {
            let image = $('#iid').val();
            let time = $('#itime').val();
            let idesc = $('#idesc').val();
            let more = getImoreListVal();
            addItemByInfo(image, time, idesc, more);
            // items.length: số thứ tự của item trong danh sách item
            addItemViewHtml(items.length, getStringLengthOf(6, image), getStringLengthOf(12,time))
            $('#iid-noti').hide()
            $('#iid-noti').text('')  
        } else {
            $('#iid-noti').text('Bạn phải nhập trường này và nhập đúng số')
            $('#iid-noti').show()
        }
    })

    $('#update').click(function () {
        if (isValidId($('#iid').val())) {
            if (update_item_index >= 0 && update_item_index < items.length) {
                items[update_item_index].image = $('#iid').val();
                items[update_item_index].time = $('#itime').val();
                items[update_item_index].idesc = $('#idesc').val();
                items[update_item_index].more = getImoreListVal();
            }
            $('#iid-noti').hide()
            $('#iid-noti').text('') 
            renderItemsListView();
        } else {
            $('#iid-noti').text('Bạn phải nhập trường này và nhập đúng số')
            $('#iid-noti').show()
        }
    })

    $('#cancel').click(function () {
        renderItemsListView();
    })

    $(document).on('click', '.delete-item', function () {
        let index = getIndexOfItem($(this).closest('.item'));
        deleteItemByIndex(index);
        renderItemsListView();
    })


    $(document).on('click', '.duplicate-item', function () {
        let index = getIndexOfItem($(this).closest('.item'));
        let newItem = {
            image:items[index].image,
            time:items[index].time,
            idesc:items[index].idesc,
            more:items[index].more,
        }
        insertItemAt(index, newItem)
        renderItemsListView()
    })

    $(document).on('click', '.edit-item', function () {
        nonSelectAllEditBtn()
        selectBtn(this)
        update_item_index = getIndexOfItem($(this).closest('.item'))
        showItemByIndex(update_item_index)
        $('#update').show()
        $('#cancel').show()
        $('#add').hide()
    })

    $(document).on('click', '.del-imore', function () {
        $(this).closest('.imore').remove()
    })




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
        trealet = {exec:exec, title:title, author:author, desc:desc, bgcolor:bgcolor, color:color, items:items}
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

    $('#save').click(function () {
        gatherData();
        let datastring = JSON.stringify({trealet:trealet}, null, "\t");
        $("#download").attr("href", makeFile(datastring));
        $("#download").css("display", "block");
    })

    $('#new').click(function () {
        resetMainForm();
        resetItemForm();
        items = [];
        resetItemsListView();
    })

});