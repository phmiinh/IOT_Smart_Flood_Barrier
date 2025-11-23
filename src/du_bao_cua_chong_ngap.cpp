#include<bits/stdc++.h>
using namespace std;
float lim_hum,lim_temp,warn_hum,warn_temp; // giới hạn chênh lệch độ ẩm, nhiệt độ
int time_range; //khoảng cách giữa các lần đo(phút)
void dong_cua(){
    cout<<"Dong\n";
}
void gui_canh_bao(){
    cout<<"Canhbao\n";
}
float getTempCritical(int min) {
  if (min <= 3) return 0.95;
  if (min <= 5) return 1.50; 
  if (min <= 10) return 2.50;
  return 3.00;
}

float getHumCritical(int min) {
  if (min <= 3) return 3.2;
  if (min <= 5) return 5.0;  
  if (min <= 10) return 8.0;
  return 10.0;
}

// 2. CẤP ĐỘ "CẢNH BÁO SỚM" (WARNING)
// Ngưỡng này thấp hơn (khoảng 60% so với Critical) để phát hiện "tiền khởi nghĩa".
float getTempWarning(int min) {
  if (min <= 3) return 0.6;
  if (min <= 5) return 0.8; 
  if (min <= 10) return 1.5;
  return 2.0;
}

float getHumWarning(int min) {
  if (min <= 3) return 2.0;
  if (min <= 5) return 3.0;
  if (min <= 10) return 5.0;
  return 6.0;
}
void hanh_dong(float last_hum,float now_hum,float last_temp,float now_temp){
    lim_hum=getHumCritical(time_range);
    warn_hum=getHumWarning(time_range);
    lim_temp=getTempCritical(time_range);
    warn_temp=getTempWarning(time_range);
    if(last_hum>=98){
        dong_cua();
    }
    if(now_hum-last_hum>=lim_hum&&last_temp-now_temp>=lim_temp){
        dong_cua();
    }
    else if(now_hum-last_hum>=warn_hum&&last_temp-now_temp>=warn_temp) {
        gui_canh_bao();
    }
    else if(last_hum>=90){
        gui_canh_bao();
    }
}
int main(){
    cin>>time_range;
    float last_hum,  now_hum,  last_temp,now_temp;
    cin>>last_hum>>now_hum>>last_temp>>now_temp;
    hanh_dong(last_hum,  now_hum,  last_temp,now_temp);

}