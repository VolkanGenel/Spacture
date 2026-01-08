import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipManagerComponent } from './clip-manager.component';

describe('ClipManagerComponent', () => {
  let component: ClipManagerComponent;
  let fixture: ComponentFixture<ClipManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClipManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClipManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
