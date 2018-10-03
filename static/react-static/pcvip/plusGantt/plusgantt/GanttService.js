/* 定义一些常用、通用的方法，供外部调用
-----------------------------------------------------------------------------*/

function CreateGantt() {

    var gantt = new PlusGantt();

    //创建甘特图调度插件
    new GanttSchedule(gantt);

    gantt.setStyle("width:800px;height:400px");

    gantt.setAllowDragDrop(true);

    gantt.setColumns([
        { header: "", field: "ID", width: 30, cellCls: "mini-indexcolumn", align: "center", allowDrag: true, cellStyle: "cursor:move" },
        new StatusColumn(),
        { header: mini.Gantt.Name_Text, field: "Name", width: 200, name: "taskname",
            editor: { type: "textbox" }
        },
        { header: mini.Gantt.PredecessorLink_Text, field: "PredecessorLink",
            editor: {
                type: "textbox"
            },
            oncellbeginedit: function (e) {
                var table = e.source, gantt = table.owner;
                var links = e.value;
                e.value = gantt.getLinkString(links);
            }
        },
        { header: mini.Gantt.Duration_Text, field: "Duration",
            editor: {
                type: "spinner", minValue: 0, maxValue: 1000
            }
        },
        { header: mini.Gantt.Start_Text, field: "Start",
            editor: {
                type: "datepicker"
            }
        },
        { header: mini.Gantt.Finish_Text, field: "Finish",
            editor: {
                type: "datepicker"
            }
        },
        { header: mini.Gantt.PercentComplete_Text, field: "PercentComplete",
            editor: {
                type: "spinner", minValue: 0, maxValue: 100
            }
        },
        { header: "备注", field: "Note", width: 200, enterCommit: false,
            editor: { type: "textarea", minWidth: 200 }
        }
    ]);
    //设置节点列
    gantt.setTreeColumn("taskname");

    gantt.on("drawcell", function (e) {
        if (e.column.field == "Name" && e.record.Summary) {
            e.cellHtml = '<b>' + e.cellHtml + '</b>';
        }
        if (e.column.field == "Start" || e.column.field == "Finish") {
            var d = e.value;
            if (d) {
                e.cellHtml = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
            }
        }
        if (e.column.field == "PredecessorLink") {
            e.cellHtml = gantt.getLinkString(e.value);
        }
    });

    return gantt;
}


//状态列
StatusColumn = function (optons) {
    return mini.copyTo({
        name: "Status",
        width: 60,
        header: '<div class="mini-gantt-taskstatus"></div>',
        formatDate: function (date) {
            return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        },
        renderer: function (e) {
            var record = e.record;
            var s = "";
            if (record.PercentComplete == 100) {
                var t = record.Finish ? "任务完成于 " + this.formatDate(record.Finish) : "";
                s += '<div class="mini-gantt-finished" title="' + t + '"></div>';
            }
            if (record.Summary && record.FixedDate) {

                var t = "此任务固定日期，从开始日期 " + this.formatDate(record.Start)
                        + " 到完成日期 " + this.formatDate(record.Finish);
                s += '<div class="mini-gantt-constraint3" title=\'' + t + '\'></div>';
            } else if (record.ConstraintType >= 2 && mini.isDate(record.ConstraintDate)) {
                var ct = mini.Gantt.ConstraintType[record.ConstraintType];
                if (ct) {
                    var ctype = ct.Name;
                    var t = "此任务有 " + ct.Name + " 的限制，限制日期 " + this.formatDate(record.ConstraintDate);
                    s += '<div class="mini-gantt-constraint' + record.ConstraintType + '" title=\'' + t + '\'></div>';
                }
            }
            if (record.Milestone) {
                s += '<div class="mini-gantt-milestone-red" title="里程碑"></div>';
            }
            if (record.Notes) {
                var t = '备注：' + record.Notes;
                s += '<div class="mini-gantt-notes" title="' + t + '"></div>';
            }
            if (record.Conflict == 1) {
                var t = "此任务排程有冲突，如有必要，请适当调整";
                s += '<div class="mini-gantt-conflict" title="' + t + '"></div>';
            }

            //如果有新的任务状态图标显示, 请参考以上代码实现之......

            return s;
        }
    }, optons);
}