; MOVE SPRITE RIGHT OR LEFT
.ORG 0x210

LD V0, 10        ; X = 10
LD V1, 15        ; Y = 15
LD I, sprite     ; sprite ptr

LD V2, 0x1       ; key "1" = LEFT
LD V3, 0x2       ; key "2" = RIGHT
LD V4, 0x1       ; amount to subtract or add

; DRAW SPRITE ONCE
DRW V0, V1, 8

main_loop:
LD I, sprite
DRW V0, V1, 8

; IF KEY 1 IS PRESSED, MOVE LEFT
SKP V2
JP check_right
SUB V0, V4 ; (SUB 1 FROM V0, MOVE LEFT)
JP draw

check_right:
; IF KEY 2 IS PRESSED, MOVE RIGHT
SKP V3
JP draw
; ADD 1 TO V0 (MOVE RIGHT)
ADD V0, V4

draw:
LD I, sprite
DRW V0, V1, 8
JP main_loop

sprite:
.byte 0b11111111  ; ████████
.byte 0b10000001  ; █      █
.byte 0b10111101  ; █ ████ █
.byte 0b10100101  ; █ █  █ █
.byte 0b10100101  ; █ █  █ █
.byte 0b10111101  ; █ ████ █
.byte 0b10000001  ; █      █
.byte 0b11111111  ; ████████
