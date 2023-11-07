import { Component, Prop, State, h, Event, EventEmitter } from '@stencil/core';
// 2. navBlank出现的时候还要展示动画, 不是动态类就没有动画了
// 3. 
@Component({
  tag: 'top-navbar',
  styleUrl: 'top-navbar.css',
  shadow: true,
})
export class TopNavbar {
  // nav顶部hover项
  @State() curNavItemHoverIndex: number = -1;
  @State() curNavItemHover: any = null;

  // nav-blank面板是否hover
  @State() isHoverNavBlank: Boolean = false;

  // nav-blank面板二级菜单hover项
  @State() curNavChiItemHoverIndex: number = -1;
  @State() curNavChiItemHover: any = null;

  

  /**
   * 左侧logo区域的展示
   */
  @Prop() logojson: string;

  /**
   * nav区域展示
   */
  @Prop() navjson: string;

  // 一级nav菜单点击事件
  @Event() menuNavClick: EventEmitter<any>;

  // 二级nav菜单点击事件
  @Event() chiNavClick: EventEmitter<any>;

  // 三级nav菜单点击事件
  @Event() thrNavClick: EventEmitter<any>;

  // TODO：传入字符串转json有没有别的途径
  private getLogoJson(): any {
    return JSON.parse(this.logojson);
  }

  
  private getNavJson(): any {
    return JSON.parse(this.navjson);
  }

  // 菜单list外层盒子离开事件
  handleMenuListLeave() {
    setTimeout(()=>{
      if(this.isHoverNavBlank) return
      this.curNavItemHoverIndex = -1
      this.curNavItemHover = null
    }, 0)
  }
  // 顶部nav项点击事件：向外抛出点击事件+跳转参数
  handleNavItemClick(navItem){
    this.menuNavClick.emit(navItem);
  }

  // 顶部nav项hover事件
  // 缓存当前hover项数据, hover动态类的展开
  // 用于二级三级下拉展示
  handleNavItemHover(navItem, index){
    this.curNavItemHoverIndex = index
    this.curNavItemHover = navItem
    // 有二级菜单项情况，则将二级菜单第一项hover
    navItem.childrenNav && navItem.childrenNav[0] && this.handleChiItemMounseOver(navItem.childrenNav[0], 0)
  }

  // 下拉面板mouseover事件
  handleNavBlankMouseEnter(){
    this.isHoverNavBlank = true
  }
  
  // 下拉面板mouseout事件
  handleNavBlankMouseLeave(){
    this.isHoverNavBlank = false
    this.handleMenuListLeave()
  }

  // 三级菜单无内容时候，将二级菜单填充到三级菜单
  generateThrNavData(navChiItem){
    const tempChiItem = { ...navChiItem }
    if(!navChiItem.childrenNav){
      navChiItem.childrenNav = [tempChiItem]
    }
    return navChiItem
  }

  // 二级菜单mouseover事件
  handleChiItemMounseOver(navChiItem, navChiIndex){
    // 前置清空三级菜单
    this.curNavChiItemHoverIndex = -1
    this.curNavChiItemHover = null
    // 辅助生成二级菜单有数据、三级菜单未空的场景
    const newNavChiItem = this.generateThrNavData(navChiItem)
    this.curNavChiItemHoverIndex = navChiIndex
    this.curNavChiItemHover = newNavChiItem
  }

  // 三级菜单项展开
  handleChiItemClick(navChiItem){
    this.chiNavClick.emit(navChiItem);
  }
 
  // 三级菜单项展开
  handleThrItemClick(navThrItem){
    this.thrNavClick.emit(navThrItem);
  }
  
  // 移动端板子是否展示
  @State() isMobileShow: Boolean = false;

  // mobile的选项按钮点击
  handleOptIconClick(){
    this.isMobileShow = true
  }

  // mobile上方区域的关闭按钮点击
  handleCloseIconClick(){
    this.isMobileShow = false
  }
  render() {
    return <div class="top-navbar">
      <div class="header-lf">
        <a class="logo">
          <img class="logo-img" src={ this.getLogoJson().logoImgSrc } alt={ this.getLogoJson().logoAlt }/>
          <span class="logo-value">{ this.getLogoJson().logoText }</span>
        </a>
      </div>
      <div class="nav-wrapper">
        <div class="menu-list" onMouseLeave = { () => { this.handleMenuListLeave() } }>
          {
            this.getNavJson().map((navItem: any, index: number)=>{
              return <div 
                class = {`menu-item ${index === this.curNavItemHoverIndex ? 'active': ''}` }
                onClick = { () =>{ this.handleNavItemClick(navItem) } }
                onMouseOver = { () => {this.handleNavItemHover(navItem, index) } }
              >{ navItem.label }</div>
            })
          }
        </div>
      </div>
      {
        this.isMobileShow && 
        <div class="mobile-nav-blank">
          <div class="mobile-nav-top">
          <div class="mobile-close-icon" onClick = { () =>{ this.handleCloseIconClick() } }>
            </div>
          </div>
          <div class="mobile-menu-list">
            {
              this.getNavJson().map((navItem)=>{
                return <div 
                  class = {`mobile-menu-item` }
                > 
                  { navItem.label }
                </div>
              })
            }
          </div>
        </div>
      }
      {
        this.curNavItemHover && this.curNavItemHover.childrenNav && 
        <div 
          class={`nav-blank show` }
          onMouseEnter = { () => {this.handleNavBlankMouseEnter()} }
          onMouseLeave = { () => {this.handleNavBlankMouseLeave()} }
        >
          {
            <div class="left-menu">
              { 
                this.curNavItemHover.childrenNav.map((navChiItem, navChiIndex) => {
                  return <div 
                    class = {`left-menu-item ${ navChiIndex === this.curNavChiItemHoverIndex ? 'active': '' }`  }
                    onMouseOver = { () => { this.handleChiItemMounseOver(navChiItem, navChiIndex) }}
                    onClick = { () => { this.handleChiItemClick(navChiItem) }}
                  >
                    <span>{ navChiItem.label}</span>  
                  </div>
                })
              }
            </div>
          }
          {
            this.curNavChiItemHover && this.curNavChiItemHover.childrenNav && 
            <div class="right-detail">
              {
                this.curNavChiItemHover.childrenNav.map((navThrItem)=>{
                  return <div 
                    class = {`right-detail-item` }
                    onClick = { () => { this.handleThrItemClick(navThrItem) }}
                  >{ navThrItem.label}</div>
                })
              }
            </div>
          }
        </div>
      }
      <slot name="right-operation"></slot>
      <div class="option-icon" onClick = { () => { this.handleOptIconClick() }}></div>
    </div>;
  }
}
