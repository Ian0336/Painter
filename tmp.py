""" from PIL import Image
tools = ["text","brush","eraser","circle","circle_filled","rectangle","rectangle_filled","triangle","triangle_filled"]
# 開啟圖片檔案

for tool in tools:

    image = Image.open(f'{tool}.png')

   
    image = image.resize((20, 20))

    # 儲存縮小後的圖片
    image.save(f'./img/{tool}_cur.png') """

""" x6 = 0x000000007777AAAA
x7 = 0x0000000088880000
x28 = 0x00000000AAAAEEEE
x29 = 0x0000000000000FFF
x6 = x6 | x7
print('%#x' % x6)
x6 = x6 & x28
print('%#x' % x6)
x6 = x6 << 32
print('%#x' % x6) """
x = int('11111110000001010000010011100011', 2)
print('%#x' % x)
