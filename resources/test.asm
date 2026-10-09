; TEST ROM - MOVE SPRITE UP/DOWN/LEFT/RIGHT

; You first instruction should always be at 0x200
; since it is where most emulators expect the program to start,
; so they automatically start executing from that address.
.ORG 0x200

LD V0, 10        ; X = 10
LD V1, 15        ; Y = 15
LD I, sprite1     ; I = sprite address

LD V2, 0x4       ; button "4" = LEFT
LD V3, 0x6       ; button "6" = RIGHT
LD V4, 0x2       ; button "2" = UP
LD V5, 0x8       ; button "8" = DOWN

LD V7, 0x1       ; amount of moviment each frame

; FISRT DRAW OTHERWISE THE MAIN LOOP DRAW WILL ERASE NOTHING
DRW  V0, V1, 8

; START MAIN LOOP
main_loop:

; remember the old position
LD V8, V0
LD V9, V1

; CHECK BUTTONS AND MOVE SPRITE ACCORDINGLY
SKNP V2             ; Skip next instruction if button "4" is not pressed
CALL move_left
SKNP V3             ; Skip next instruction if button "6" is not pressed
CALL move_right
SKNP V4             ; Skip next instruction if button "2" is not pressed
CALL move_up
SKNP V5             ; Skip next instruction if button "8" is not pressed
CALL move_down
JP draw


move_left:
SUB V0, V7
RET

move_right:
ADD V0, V7
RET

move_up:
SUB V1, V7
RET

move_down:
ADD V1, V7
RET

draw:
LD I, sprite2
; erase old and draw new, back to back
DRW V8, V9, 8
DRW V0, V1, 8
JP main_loop


; === DEFINE SPRITES ===
; ALWAYS KEEP DATA AT END
; TO AVOID MIXING CODE AND DATA

sprite1:
.byte 0b11111111  ; ████████
.byte 0b10000001  ; █      █
.byte 0b10111101  ; █ ████ █
.byte 0b10100101  ; █ █  █ █
.byte 0b10100101  ; █ █  █ █
.byte 0b10111101  ; █ ████ █
.byte 0b10000001  ; █      █
.byte 0b11111111  ; ████████

; Test multiple bytes at the same .byte directive
sprite2:
.byte 0b11111111 0b10000001 0b10111101  ; ████████ █      █  █ ████ █
.byte 0b10100101  ; █ █  █ █
.byte 0b10100101  ; █ █  █ █
.byte 0b10111101  ; █ ████ █
.byte 0b10000001  ; █      █
.byte 0b11111111  ; ████████
