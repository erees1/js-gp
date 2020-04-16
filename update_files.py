import shutil
import os

def main():
    website_path = '../../Website/edward-rees.com'
    shutil.copyfile(os.path.join(website_path, 'assets/js/GP.js'), './js/GP.js')
    shutil.copyfile(os.path.join(website_path, 'assets/css/GP.css'), './css/GP.css')

if __name__ == '__main__':
    main()