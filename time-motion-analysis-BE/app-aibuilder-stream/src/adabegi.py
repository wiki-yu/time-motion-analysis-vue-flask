import os
import sys
import argparse
import yaml
import numpy as np
import cv2
import importlib

def get_parent_dir(n=1):
    current_path = os.path.dirname(os.path.abspath(__file__))
    for k in range(n):
        current_path = os.path.dirname(current_path)
    return current_path

actual_path = get_parent_dir(1) # Path where this file is saved
adabegi_path = os.path.join(actual_path, "adabegi")
sys.path.append(adabegi_path)
models_path = os.path.join(actual_path, "trained_models")
sys.path.append(models_path)
data_path = os.path.join(actual_path, "data")
vid_path_default = "project-1.mp4"

parser = argparse.ArgumentParser(argument_default=argparse.SUPPRESS)
parser.add_argument(
        "--video_name",
        type=str,
        dest="vid_name",
        default=vid_path_default,
        help="Name of the video to be processed. Default is " + vid_path_default,
    )

config_file_name_default = "./project_4.yaml"
parser.add_argument(
        "--config_file_name",
        type=str,
        dest="config_file_name",
        default=config_file_name_default,
        help="Name of the config_file. Default is " + config_file_name_default,
    )

args = parser.parse_args()
source = os.path.join(data_path, args.vid_name)

with open(args.config_file_name, 'r') as stream:
    try:
    	config_file = yaml.safe_load(stream)
    except yaml.YAMLError as exc:
        print(exc)

# Define the execution method type
class execution_method:
	def __init__(self,**kwargs):
		self.type = kwargs.get("type")
		self.save_output = kwargs.get("save_output")
		self.output_vid_name = kwargs.get("output_vid_name")

method1 = execution_method()


for att in config_file["method"]:
	print("att is: ~~~~~~~~~~", att)
	setattr(method1, str(att), config_file["method"][str(att)])
print("!!!!!!!!!!!!!!!!!!")
print(method1.type)
print(method1.save_output)
print(method1.output_vid_name)

# Define the order of the blocks
input_name = [config_file["input_elements"]]
output_name = config_file["output_elements"]
print("input name: ", input_name)
print("output name: ", output_name)
print("***********************************************************1")
block_order = []

for block in config_file["block_definitions"]:
	if not block in block_order:
		print(config_file["block_definitions"][str(block)]["input_elements"].values())
		print("----------------------------------------")
		if all(item in input_name for item in config_file["block_definitions"][str(block)]["input_elements"].values()) :
			block_order.append(block)
			input_name.extend(config_file["block_definitions"][str(block)]["output_elements"].values())
		# print("input_name", input_name)

print("Block order: ", block_order)
variable_values = {key: None for key in input_name} 
print("Variable names initialized: ",variable_values) 
print("***********************************************************2")

class block:
	def __init__(self,**kwargs):
		self.adabegi = kwargs.get("adabegi")
		self.input_elements = kwargs.get("input_elements")
		self.ouput_elements = kwargs.get("ouput_elements")
		self.block_options = kwargs.get("block_options")
		self.model_name = kwargs.get("model_name")
		self.model_options = kwargs.get("model_options")
		self.initialize_variables = kwargs.get("initialize_variables")
		self.finalize = kwargs.get("finalize")

block_chain = []

for i in range(len(block_order)):
	block1 = block()
	for att in config_file["block_definitions"][str(block_order[i])]:
		setattr(block1, str(att), config_file["block_definitions"][str(block_order[i])][str(att)])
	block_chain.append(block1)

# Import the modules from adabegi
print("number of chained blocks: ", len(block_chain))

b_names = []
b_count = len(block_chain)
for i in range(b_count):
	bb_name = "bb" + str(i)
	globals()[bb_name] = block_chain[i].adabegi
	print("@@@@@@@@@@@@@@@@@@@")
	print(globals()[bb_name])
	b_name = "b" + str(i)
	b_names.append(b_name)
	globals()[b_name] = importlib.import_module(globals()[bb_name])
	print("&&&&&&&&&&&&&&&&&&&&&&")
	print(globals()[b_name])

# Import the models from trained_models
for i in range(b_count):
	if block_chain[i].model_name != None:
		m_name = "m" + str(i)
		globals()[m_name] = globals()[b_names[i]].load_model(block_chain[i].model_name,block_chain[i].model_options,models_path)
		try:
			block_chain[i].block_options["network"] = globals()[m_name]
			print("test!!!!!!!!!!!!!!!!!!!!!!!!!", block_chain[i].block_options["network"] )
		except:
			block_chain[i].block_options = {"network":globals()[m_name]}
			print("test#######################", block_chain[i].block_options["network"] )

print("***********************************************************3")

# Initialize necessary variables
for i in range(b_count):
    if block_chain[i].initialize_variables != None:
        new_var = globals()[b_names[i]].initialize_variables(block_chain[i].initialize_variables)
        # print(new_var)
        for key in new_var['new_values'].keys():
                variable_values[str(key)] = new_var['new_values'][str(key)]
        for key in new_var['new_inputs'].keys():
        	block_chain[i].input_elements[str(key)]=new_var['new_inputs'][str(key)]
        for key in new_var['new_outputs'].keys():
        	block_chain[i].output_elements[str(key)]=new_var['new_outputs'][str(key)]

print("***********************************************************4")

cap = cv2.VideoCapture(source)
if not cap.isOpened():
    raise IOError("Couldn't open webcam or video")

if method1.save_output:
	if method1.output_vid_name != None:
		print("use fixed name from config file")
		output_path = os.path.join(actual_path, "outputs", str(method1.output_vid_name)+'.mp4')
	else:
		print("use the input video name")
		output_vid_name = args.vid_name.split('.')
		output_vid_name = output_vid_name[0] + '.mp4'
		output_path = os.path.join(actual_path, "outputs", output_vid_name)

	# Get output video ready and obtain characteristics
	video_fps = cap.get(cv2.CAP_PROP_FPS)
	video_size = (
	    int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
	    int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
	)

	print("Processing {} with frame size {} at {:.1f} FPS".format(
			os.path.basename(source), video_size, video_fps)    )

	try:
		# video_FourCC = cv2.VideoWriter_fourcc(*"mp4v")
		video_FourCC = cv2.VideoWriter_fourcc('H','2','6','4')
		print("Picking up video encoder!!!")
		out = cv2.VideoWriter(output_path, video_FourCC, video_fps, video_size)
	except:
		video_FourCC = cv2.VideoWriter_fourcc('H','2','6','4')
		out = cv2.VideoWriter(output_path, video_FourCC, video_fps, video_size)

cnt = 0
while(True):
	ret, frame = cap.read()
	if not ret:
		break
	variable_values["input_frame"] = frame.copy() 
	cnt += 1

	print("cnt is: ", cnt)
	for i in range(len(block_chain)):
		# input image
		inputs = {key: variable_values[str(block_chain[i].input_elements[str(key)])] for key in block_chain[i].input_elements.keys()}
        # output image
		outputs = globals()[b_names[i]].function(inputs, block_chain[i].block_options)
		print("key is: ", key)
		print("output keys: ", outputs.keys)
		for key in outputs.keys():
			variable_values[str(block_chain[i].output_elements[str(key)])] = outputs[str(key)]

	if cv2.waitKey(1)>0:
		break

	if method1.save_output:
		out.write(variable_values["output_frame"])

cap.release()
cv2.destroyAllWindows()

if method1.save_output:
	out.release()

# Save required files
for i in range(b_count):
	if block_chain[i].finalize!=None:
		inputs = {key: variable_values[str(block_chain[i].input_elements[str(key)])] for key in block_chain[i].input_elements.keys()}
		globals()[b_names[i]].finalize(inputs, block_chain[i].finalize, args.vid_name)
        
print("ENDDDDDDDD!")
