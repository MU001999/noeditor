var fs = require('fs');
var path = null;
document.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();

    for (let f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path)
        fs.readFile(f.path, 'utf8', function (err, data) {
            document.getElementById('codeEditor').innerText = data;
            path = f.path;
        });
    }
});
document.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
});

function save(path)
{
    if (path)
    {
        fs.writeFile(path, document.getElementById('codeEditor').innerText, function (err){
            if (err)
            {
                alert('保存失败');
            }
        });
    }
    else
    {
        alert('请先拖拽打开文件');
        save(path);
    }
}

function run(e) {
    if (e.ctrlKey == true && e.keyCode == 83) {
        e.preventDefault();
        save(path);
        return;
    }
    var code = document.getElementById('codeEditor').innerText;
    scan(code)
}

var TOKEN = {
    "TAT": 0,
    "TATAT": 1,
    "TATATAT": 2,
    "TKEYWORD": 3,
    "TIDENTIFIER": 4,
    "TDOUBLE": 5,
    "TSTRING": 6,
    "TASSIGN": 7,
    "TCOMMA": 8,
    "TDOT": 9,
    "TCOMMNET": 10,
    "TLPAREN": 11,
    "TRPAREN": 12,
    "TLBRACE": 13,
    "TRBRACE": 14,
    "TOPRETOR": 15
};

var State = {
    "Begin": 0,
    "InAT": 1,
    "InATAT": 2,
    "InNot": 3,
    "InCLT": 4,
    "InCGT": 5,
    "InComment": 6,
    "InInteger": 7,
    "InDouble": 8,
    "InIdentifier": 9,
    "InString": 10
};

var Colors = {
    "operator": "#00FFFF",
    "logicoperator": "#800000",
    "atat": "#FFE4E1",
    "atatat": "#FF6347",
    "numeric": "#008000",
    "keyword": "#FF00FF",
    "ident": "#008B8B",
    "string": "#B22222",
    "comment": "#FFFFFF"
};

function scan(text) {
    var obj = document.getElementById('previewDiv');
    obj.innerHTML = "";

    var tokens = new Array();
    var code = new String(text + '$');

    var state = State.Begin;
    var value = new String();
    var i = 0;
    while (i < code.length) {
        switch (state) {
            case State.Begin:
                switch (code[i]) {
                    case '$':
                        tokens.push(TOKEN.TEND);
                        break;
                    case '#':
                        value += "#";
                        state = State.InComment;
                        break;
                    case '"':
                        value += '"';
                        state = State.InString;
                        break;
                    case '@':
                        state = State.InAT;
                        break;
                    case ':':
                    case ',':
                    case '.':
                    case '(':
                    case ')':
                    case '{':
                    case '}':
                        addTextToTextarea(code[i]);
                        break;
                    case '+':
                    case '-':
                    case '*':
                    case '/':
                        addTextToTextarea(code[i], Colors.operator);
                        break;
                    case '%':
                    case '&':
                    case '|':
                    case '^':
                    case '~':
                    case '=':
                    case '!':
                    case '<':
                    case '>':
                        addTextToTextarea(code[i], Colors.logicoperator);
                        break;
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        state = State.InInteger;
                        value += code[i];
                        break;
                    case '\n':
                        obj.innerHTML += "<br>";
                        break;
                    case ' ':
                        obj.innerHTML += "&nbsp;";
                        break;
                    default:
                        if (('a' <= code[i] && code[i] <= 'z') || ('A' <= code[i] && code[i] <= 'Z') || code[i] == '_') {
                            state = State.InIdentifier;
                            value += code[i];
                        }
                        else if (code[i] == '"') {
                            state = State.InString;
                        }
                        else {
                            addTextToTextarea(code[i]);
                        }
                        break;
                }
                break;

            case State.InAT:
                switch (code[i]) {
                    case '@':
                        state = State.InATAT;
                        break;
                    default:
                        addTextToTextarea('@');
                        state = State.Begin;
                        i--;
                        break;
                }
                break;

            case State.InATAT:
                switch (code[i]) {
                    case '@':
                        addTextToTextarea('@@@', Colors.atatat);
                        state = State.Begin;
                        break;
                    default:
                        addTextToTextarea('@@', Colors.atat);
                        state = State.Begin;
                        i--;
                        break;
                }
                break;

            case State.InInteger:
                switch (code[i]) {
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        value += code[i];
                        break;
                    case '.':
                        value += '.';
                        state = State.InDouble;
                        break;
                    default:
                        addTextToTextarea(value, Colors.numeric);
                        state = State.Begin;
                        value = "";
                        i--;
                        break;
                }
                break;

            case State.InDouble:
                switch (code[i]) {
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        value += code[i];
                        break;
                    default:
                        addTextToTextarea(value, Colors.numeric);
                        state = State.Begin;
                        value = "";
                        i--;
                        break;
                }
                break;

            case State.InIdentifier:
                if (('a' <= code[i] && code[i] <= 'z') || ('A' <= code[i] && code[i] <= 'Z') || code[i] == '_') {
                    value += code[i];
                }
                else {
                    switch (value) {
                        case "using":
                        case "if":
                        case "if":
                        case "else":
                        case "while":
                        case "do":
                        case "for":
                        case "to":
                        case "break":
                        case "continue":
                        case "return":
                        case "new":
                        case "none":
                        case "true":
                        case "false":
                        case "and":
                        case "or":
                        case "not":
                            addTextToTextarea(value, Colors.keyword);
                            break;
                        default:
                            addTextToTextarea(value, Colors.ident);
                            break;
                    }
                    state = State.Begin;
                    value = "";
                    i--;
                }
                break;

            case State.InString:
                switch (code[i]) {
                    case '"':
                        addTextToTextarea(value + '"', Colors.string);
                        state = State.Begin;
                        value = "";
                        break;
                    default:
                        value += code[i];
                        break;
                }
                break;

            case State.InComment:
                while (i < code.length && code[i] != '\n') {
                    value += code[i];
                    i++;
                }
                addTextToTextarea(value, Colors.comment);
                state = State.Begin;
                value = "";
                i--;
                break;

            default:
                break;
        }
        i++;
    }
    return tokens;
}

function addTextToTextarea(txt, color) {
    var divObj = document.getElementById('previewDiv');
    var fontObj = document.createElement('font');
    if (!color) color = "#000000";
    fontObj.color = color;
    var textObj = document.createTextNode(txt);
    fontObj.appendChild(textObj);
    divObj.appendChild(fontObj);
}