import cv2
import json
import sys
import tensorflow as tf

def main():
    # cap = cv2.VideoCapture("./sample.mp4")
    cap = cv2.VideoCapture("./public/" + sys.argv[1])
    # Check if video opened sucessfully
    if cap.isOpened() == False:
        print("Open video file error!")
    # Get the frame property
    frame_rate = int(round(cap.get(cv2.CAP_PROP_FPS)))
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    # print("The frame width: {}, height: {}, fps: {}".format(frame_width, frame_height, frame_rate))
    data = {
        "fps": frame_rate,
        "width": frame_width,
        "height": frame_height
    }
    # print(df_table.to_numpy(), exh_onsets, inh_onsets)
    print(json.dumps(data))
    # print(df_table.to_numpy())

if __name__ == "__main__":
    main()


