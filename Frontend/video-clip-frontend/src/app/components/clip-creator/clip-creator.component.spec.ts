import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipCreatorComponent } from './clip-creator.component';

describe('ClipCreatorComponent', () => {
  let component: ClipCreatorComponent;
  let fixture: ComponentFixture<ClipCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClipCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClipCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
