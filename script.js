const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const text_input_box = document.getElementById('input_text')
const text_output_box = document.getElementById('output_text')
const rotate_input_box = document.getElementById('rot_text')
const decode_toggle = document.getElementById('decode_toggle')
const decode_toggle_control = document.getElementById('decode_toggle_control')
const num_letters = 26
const ascii_letter_offset = 97

const size_x = 1000
const size_y = 1000
const centre_x = size_x / 2
const centre_y = size_y / 2
const letter_radius = 400
const angle_offset_rads = -Math.PI / 2
const line_width = 2
const letter_select_radius = 24
const center_circle_radius = 2

const decode_selection_ring_radius = letter_select_radius + 10

const big_arrow_radius = letter_radius + 70

const color_key_offset_x = 20
const color_key_offset_y = 70
const color_key_line_spacing = 30
const color_key_dot_spacing = 16
const color_key_dot_radius = 4

const bg_color = '#111'
const fore_color = '#eee'
const target_color = '#4dd'
const encode_color = '#d44'
const decode_color = '#da0'
const encode_and_decode_color = '#4d4'
const font_letters = '34px Consolas'
const font_color_keys = '20px Consolas'
const text_align_letters = 'center'
const text_align_color_keys = 'left'
const text_baseline = 'middle'


window.addEventListener('load', start)
text_input_box.addEventListener('keyup', update)
rotate_input_box.addEventListener('change', update)
decode_toggle.addEventListener('change', update)

function start() {
    ctx.textBaseline = text_baseline 
    ctx.lineWidth = line_width
    update()
}
function update() {
    const input_text = text_input_box.value
    const rot_offset = parseInt(rotate_input_box.value)
    const is_decoding = decode_toggle.checked
    console.log(is_decoding)
    decode_text(input_text, is_decoding ? 26 - rot_offset : rot_offset)

    if (rot_offset == 13) {
        decode_toggle_control.style.visibility = 'hidden';
    } else {
        decode_toggle_control.style.visibility = null;
    }

    const filtered_text = input_text.match(/[a-z](?=[^a-z]*$)/)

    if(filtered_text == null) {
        console.log('filtered text is null')
    }
    const target_letter = filtered_text == null ? 'a' : filtered_text[0]
    
    draw(target_letter, rot_offset, is_decoding)
}


function draw(target_letter, rot_offset, is_decoding) {
    clear()
    draw_letters()

    const target_index = letter_to_index(target_letter)
    const encode_index = add_index(target_index, rot_offset)
    const decode_index = add_index(target_index, 26 - rot_offset)

    highlight_letter(target_index, target_color)
    draw_color_key(0, 'input value', target_color)

    const encode_and_decode_are_same = rot_offset == 13
    if (encode_and_decode_are_same) {
        highlight_letter(encode_index, encode_and_decode_color)
        draw_color_key(1, 'encoded & decoded value', encode_and_decode_color)

    }
    else {
        highlight_letter(encode_index, encode_color)
        highlight_letter(decode_index, decode_color)
        draw_color_key(1, 'encoded value', encode_color)
        draw_color_key(2, 'decoded value', decode_color)
    }
    draw_decode_selection_circle(is_decoding ? decode_index : encode_index)
    draw_center_dot()
    draw_big_arrow(target_index, is_decoding ? decode_index : encode_index, is_decoding)
}


function clear() {
    ctx.fillStyle = bg_color
    ctx.fillRect(0, 0, size_x, size_y)
}
function draw_letters() {
    ctx.fillStyle = fore_color
    ctx.font = font_letters
    ctx.textAlign = text_align_letters

    let letter, angle_rads, pos_x, pos_y
    for (let i = 0; i < num_letters; i++) {
        letter = index_to_letter(i)
        angle_rads = 2 * Math.PI * i / num_letters + angle_offset_rads
        pos_x = centre_x + Math.cos(angle_rads) * letter_radius
        pos_y = centre_y + Math.sin(angle_rads) * letter_radius
        ctx.fillText(letter, pos_x, pos_y)
    }
}
function highlight_letter(index, stroke_color) {
    ctx.strokeStyle = stroke_color

    const angle_rads = 2 * Math.PI * index / num_letters + angle_offset_rads
    let pos_x = centre_x + Math.cos(angle_rads) * letter_radius
    let pos_y = centre_y + Math.sin(angle_rads) * letter_radius
    draw_cirle(pos_x, pos_y, letter_select_radius)

    pos_x = centre_x + Math.cos(angle_rads) * (letter_radius - letter_select_radius)
    pos_y = centre_y + Math.sin(angle_rads) * (letter_radius - letter_select_radius)
    draw_line(centre_x, centre_y, pos_x, pos_y)
}
function draw_color_key(index, name, fill_color) {
    ctx.fillStyle = fill_color
    ctx.font = font_color_keys
    ctx.textAlign = text_align_color_keys

    let pos_x = color_key_offset_x
    const pos_y = size_y - color_key_offset_y + index * color_key_line_spacing
    draw_fill_cirle(pos_x, pos_y, color_key_dot_radius)

    pos_x += color_key_dot_spacing
    ctx.fillText(name, pos_x, pos_y)
}
function draw_center_dot() {
    ctx.fillStyle = fore_color
    draw_fill_cirle(centre_x, centre_y, center_circle_radius)
}
function draw_decode_selection_circle(index) {
    ctx.strokeStyle = fore_color

    const angle_rads = 2 * Math.PI * index / num_letters + angle_offset_rads
    const pos_x = centre_x + Math.cos(angle_rads) * letter_radius
    const pos_y = centre_y + Math.sin(angle_rads) * letter_radius
    draw_dashed_arc(pos_x, pos_y, decode_selection_ring_radius, 0, 2 * Math.PI)
}
function draw_big_arrow(current_index, target_index, is_decoding) {
    ctx.strokeStyle = fore_color

    const start_angle_rads = 2 * Math.PI * current_index / num_letters + angle_offset_rads
    const end_angle_rads = 2 * Math.PI * target_index / num_letters + angle_offset_rads
    if(is_decoding)
        draw_dashed_arc(centre_x, centre_y, big_arrow_radius, end_angle_rads, start_angle_rads)
    else
        draw_dashed_arc(centre_x, centre_y, big_arrow_radius, start_angle_rads, end_angle_rads)

    {
        const angle_rads = 2 * Math.PI * current_index / num_letters + angle_offset_rads
        let start_x = centre_x + Math.cos(angle_rads) * (letter_radius + letter_select_radius)
        let start_y = centre_y + Math.sin(angle_rads) * (letter_radius + letter_select_radius)
        let end_x = centre_x + Math.cos(angle_rads) * big_arrow_radius
        let end_y = centre_y + Math.sin(angle_rads) * big_arrow_radius
        draw_dashed_line(start_x, start_y, end_x, end_y) 
    }
    {
        const angle_rads = 2 * Math.PI * target_index / num_letters + angle_offset_rads
        let start_x = centre_x + Math.cos(angle_rads) * (letter_radius + decode_selection_ring_radius)
        let start_y = centre_y + Math.sin(angle_rads) * (letter_radius + decode_selection_ring_radius)
        let end_x = centre_x + Math.cos(angle_rads) * big_arrow_radius
        let end_y = centre_y + Math.sin(angle_rads) * big_arrow_radius
        draw_dashed_line(start_x, start_y, end_x, end_y) 
    }
}


function draw_cirle(pos_x, pos_y, radius) {
    ctx.beginPath()
    ctx.arc(pos_x, pos_y, radius, 0, Math.PI * 2)
    ctx.stroke()
}
function draw_fill_cirle(pos_x, pos_y, radius) {
    ctx.beginPath()
    ctx.arc(pos_x, pos_y, radius, 0, Math.PI * 2)
    ctx.fill()
}
function draw_dashed_line(start_x, start_y, end_x, end_y) {
    ctx.beginPath()
    ctx.setLineDash([5,5])
    ctx.moveTo(start_x, start_y)
    ctx.lineTo(end_x, end_y)
    ctx.stroke()
    ctx.setLineDash([])
}
function draw_dashed_arc(pos_x, pos_y, radius, startAngle, endAngle) {
    ctx.beginPath()
    ctx.setLineDash([5,5])
    ctx.arc(pos_x, pos_y, radius, startAngle, endAngle)
    ctx.stroke()
    ctx.setLineDash([])
}
function draw_line(start_x, start_y, end_x, end_y) {
    ctx.beginPath()
    ctx.moveTo(start_x, start_y)
    ctx.lineTo(end_x, end_y)
    ctx.stroke()
}


function letter_to_index(letter) {
    const ascii_letter = letter.charCodeAt(0)
    return ascii_letter - ascii_letter_offset
}
function index_to_letter(index) {
    const ascii_letter = index + ascii_letter_offset
    return letter = String.fromCharCode(ascii_letter)
}
function add_index(index, delta) {
    return (index + delta) % num_letters
}


function decode_text(input_text, rotate) {
    let output_text = ''

    for (let i = 0; i < input_text.length; i++) {
        const letter = input_text[i]
        if (!letter.match(/^[a-z]$/)) {
            output_text += letter
            continue
        }

        
        let index = letter_to_index(letter)
        index = add_index(index, rotate)
        const decoded_letter = index_to_letter(index)
        output_text += decoded_letter
    }

    text_output_box.value = output_text
}