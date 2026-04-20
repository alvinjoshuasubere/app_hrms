#!/bin/bash
sudo rm -rf /usr/local/share/fonts/ttfonts
sudo mkdir /usr/local/share/fonts/ttfonts
cd static && sudo cp *ttf /usr/local/share/fonts/ttfonts
sudo fc-cache -f -v
