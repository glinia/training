# NOTE: There are two root files which are the entrypoints to compilation for
# both JavaScript and CSS. Those files are:
#
#   src/js/app.{js,wisp,jsx}
#   src/style/style.scss

# Tools
SHELL := /bin/bash
JSX ?= jsx

# Variables
NODE_ENV ?= production

# Paths
DIST ?= _dist
BUILD ?= _build
JSX_FILES := $(shell find ./src/js -name '*.jsx')
WISP_FILES := $(shell find ./src/js -name '*.wisp')
WISP_MACRO_FILES := $(shell find ./src/wisp-macros -name '*.wisp')
SCSS_FILES := $(shell find ./src/style -name '*.scss')

# Default target
default: all


# Files

# files for target wisp
$(BUILD)/js/%.js: src/js/%.wisp
	@echo "Compiling wisp: $^."
	@cat $(WISP_MACRO_FILES) $^ | wisp > $@

# files for target jsx
$(BUILD)/js/%.js: src/js/%.jsx
	@echo "Compiling JSX: $^."
	@cat $^ | jsx > $@

# file for target html
$(DIST)/index.html: src/index.html
	@echo "Copying index.html."
	@cat $^ > $@

# files for target js
# TODO: debug?
$(DIST)/static/app.js: jsx wisp $(wildcard $(BUILD)/js/*.js)
	@echo "Running browserify."
	@cp src/js/app.js $(BUILD)/js/app.js
	@browserify $(BUILD)/js/app.js > $(BUILD)/bundle.js
	@echo "Running envify."
	@NODE_ENV="$(NODE_ENV)" envify $(BUILD)/bundle.js > $@

# files for target scss
# NOTE: only the root file is compiled, the rest are included by sass itself
$(DIST)/static/style.css: $(SCSS_FILES)
	@echo "Compiling SCSS."
	@sass src/style/style.scss $(DIST)/static/style.css


# Targets

all: html js css

html: $(DIST)/index.html

jsx: $(patsubst ./src/js/%.jsx,./$(BUILD)/js/%.js,$(JSX_FILES))
wisp: $(patsubst ./src/js/%.wisp,./$(BUILD)/js/%.js,$(WISP_FILES))
js: $(DIST)/static/app.js
css: $(DIST)/static/style.css


# Commands

server:
	@echo "Running server."
	@cd $(DIST) && python -m SimpleHTTPServer

dev: file-structure
	@echo "Watching for filesystem changes, while running server."
	@watchr .watchr

clean:
	@echo "Cleaning project."
	@rm -rf $(DIST)/*
	@rm -rf $(BUILD)/*
	@make file-structure

file-structure: 
	@echo "Creating file structure."
	@mkdir -p $(DIST)/static
	@mkdir -p $(BUILD)/js


.PHONY: default clean file-structure all server dev deps concat html jsx wisp
